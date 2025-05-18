import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import { AwsConfig, QueuePayloads } from 'application/aws';
import { ID } from 'domain/value-objects';

@Injectable()
export class SqsService {
  private logger = new Logger(SqsService.name);
  constructor(private readonly awsConfig: AwsConfig) {}

  async execute<Q extends keyof QueuePayloads>(
    queueName: Q,
    data: QueuePayloads[Q],
  ): Promise<void> {
    const sqs = this.awsConfig.sqs;

    try {
      const body = JSON.stringify({ message: data, pattern: queueName });

      this.logger.debug({
        message: 'Sending message to SQS',
        queueUrl: `${this.awsConfig.endpoint}/${queueName}`,
        pattern: queueName,
        messageBody: body,
        context: SqsService.name,
      });

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: `${this.awsConfig.endpoint}/${queueName}`,
          MessageBody: JSON.stringify({ message: data, pattern: queueName }),
          MessageAttributes: {
            pattern: {
              DataType: 'String',
              StringValue: queueName,
            },
          },
          MessageGroupId: 'default',
          MessageDeduplicationId: new ID().value,
        }),
      );
    } catch (error) {
      this.logger.error({
        message: 'Error sending message to SQS',
        error: error instanceof Error ? error.message : 'Unknown error',
        context: SqsService.name,
        queueUrl: `${this.awsConfig.endpoint}/${queueName}`,
        data,
        pattern: queueName,
      });
    }
  }
}
