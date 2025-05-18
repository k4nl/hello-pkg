import {
  CustomTransportStrategy,
  Server,
  Transport,
} from '@nestjs/microservices';
import {
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { SqsContext } from './sqs.contex';
import { AwsConfig } from './aws.config';
import { AwsQueue, SqsTransporterOptions } from './sqs.types';

export class SqsTransporter extends Server implements CustomTransportStrategy {
  private sqs: SQSClient;
  private maxNumberMessages: number;
  private pollingTime: number;
  private queuesName: Map<string, AwsQueue>;
  private queuesUrl: Map<AwsQueue, string> = new Map<AwsQueue, string>();

  constructor(
    private readonly config: AwsConfig,
    options: SqsTransporterOptions,
  ) {
    super();
    this.sqs = this.config.sqs;

    if (!options.queues_name) {
      this.logger.error({
        message: 'Queue name is required.',
        context: SqsTransporter.name,
      });
      throw new Error('Queue name is required.');
    }

    this.setQueues(options.queues_name);

    this.maxNumberMessages =
      options.max_number_of_messages && options.max_number_of_messages > 10
        ? options.max_number_of_messages
        : 10;

    this.pollingTime =
      options.polling_time_seconds && options.polling_time_seconds > 1
        ? options.polling_time_seconds
        : 20;
  }

  private setQueues(queues: AwsQueue[] | AwsQueue) {
    this.queuesName = new Map<string, AwsQueue>();
    if (!Array.isArray(queues)) {
      this.queuesName.set(queues, queues);
      return;
    }

    queues.forEach((queue) => {
      this.queuesName.set(queue, queue);
    });
  }

  transportId?: Transport;
  listen(callback: (...optionalParams: unknown[]) => any) {
    this.start();
    callback();
  }

  async start() {
    this.queuesName.forEach(async (queue) => {
      setInterval(async () => {
        await this.receiveMessages(this.maxNumberMessages, queue);
      }, this.pollingTime * 1000);
    });
  }

  on() {
    throw new Error('Method on not implemented.');
  }

  unwrap<T>(): T {
    throw new Error('Method unwrap not implemented.');
  }

  private async getQueueUrl(queueName: AwsQueue): Promise<string> {
    try {
      if (this.queuesUrl.has(queueName)) {
        return this.queuesUrl.get(queueName);
      }

      const queue = await this.sqs.send(
        new GetQueueUrlCommand({
          QueueName: queueName,
        }),
      );

      this.queuesUrl.set(queueName, queue.QueueUrl);

      return queue.QueueUrl;
    } catch (error) {
      this.logger.error({
        message: `Error getting queue URL. Error: ${error}`,
        context: SqsTransporter.name,
        queue_name: queueName,
        endpoint: await this.config.endpoint,
      });
      throw error;
    }
  }

  async receiveMessages(maxNumberMessages: number, queueName: AwsQueue) {
    const queueUrl = await this.getQueueUrl(queueName);

    this.sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberMessages,
        WaitTimeSeconds: this.pollingTime || 20,
      }),
      (err, data) => {
        if (err) {
          return;
        }

        if (data.Messages) {
          for (const message of data.Messages) {
            try {
              const payload = JSON.parse(message.Body);

              const pattern = payload.pattern;

              const context = new SqsContext([
                message,
                this.sqs,
                pattern,
                queueUrl,
              ]);

              this.handleEvent(
                pattern,
                {
                  data: payload.data,
                  pattern,
                },
                context,
              );
            } catch (error) {
              this.logger.error({
                message: `Error in parsing message. Error: ${error}`,
                context: SqsTransporter.name,
              });
            }
          }
        }
      },
    );
  }

  close() {
    this.logger.debug({
      message: 'Closing SQS connection',
      context: SqsTransporter.name,
    });
    this.sqs.destroy();
    this.sqs = null;
    this.logger.debug({
      message: 'SQS connection closed',
      context: SqsTransporter.name,
    });
  }
}
