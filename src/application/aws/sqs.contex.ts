import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Logger } from '@nestjs/common';
import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

type SqsContextArgs = [Record<string, any>, any, string, string];

export class SqsContext extends BaseRpcContext<SqsContextArgs> {
  private readonly logger = new Logger(SqsContext.name);

  constructor(args: SqsContextArgs) {
    super(args);
  }

  getMessage() {
    return this.args[0];
  }

  getSqsRef() {
    return this.args[1];
  }

  getPattern() {
    return this.args[2];
  }

  getQueueUrl() {
    return this.args[3];
  }

  async deleteMessage() {
    try {
      this.logger.debug({
        message: 'Deleting message from SQS',
        queueUrl: this.getQueueUrl(),
        pattern: this.getPattern(),
        messageBody: JSON.stringify(this.getMessage()),
        context: SqsContext.name,
      });

      const sqs: SQSClient = this.getSqsRef();
      const QueueUrl = this.getQueueUrl();
      const message = this.getMessage();
      const ReceiptHandle = message.ReceiptHandle;

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl,
          ReceiptHandle,
        }),
      );
      
    } catch (error) {
      this.logger.error({
        message: 'Error deleting message from SQS',
        error: error instanceof Error ? error.message : 'Unknown error',
        context: SqsContext.name,
      });

      throw Error(
        `Error in delete message.\n 
         ReceiptHandle: ${this.getMessage()?.ReceiptHandle} \n
         Message: ${error}`,
      );
    }
  }
}
