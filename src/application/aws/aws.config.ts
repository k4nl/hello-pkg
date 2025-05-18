import { SQSClient } from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSConstants } from './sqs.types';

/**
 * AwsConfig is a configuration class for AWS SQS.
 * It retrieves AWS configuration options from the config service and creates an SQS client.
 * @class
 * @description This class is responsible for configuring the AWS SQS client.
 * It retrieves the necessary configuration options from the config service and initializes the SQS client.
 */
@Injectable()
export class AwsConfig {
  public readonly sqs: SQSClient;
  public readonly logger = new Logger(AwsConfig.name);
  public region: string;
  public endpoint: string;
  public credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };

  /**
   * Retrieves AWS configuration options from the config service.
   * @returns An object containing AWS configuration options.
   * @throws {Error} If any required AWS configuration option is missing.
   * @private
   * @description This method retrieves the AWS configuration options from the config service.
   * It checks for the presence of required options and throws an error if any are missing.
   * The options include:
   * - AWS_REGION
   * - AWS_ENDPOINT
   *  - AWS_ACCESS_KEY_ID
   * - AWS_SECRET_ACCESS_KEY
   */
  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>(AWSConstants.REGION);
    const endpoint = this.configService.get<string>(AWSConstants.ENDPOINT);
    const accessKeyId = this.configService.get<string>(
      AWSConstants.ACCESS_KEY_ID,
    );
    const secretAccessKey = this.configService.get<string>(
      AWSConstants.SECRET_ACCESS_KEY,
    );

    const options = new Map<string, string | undefined>([
      [AWSConstants.REGION, region],
      [AWSConstants.ENDPOINT, endpoint],
      [AWSConstants.ACCESS_KEY_ID, accessKeyId],
      [AWSConstants.SECRET_ACCESS_KEY, secretAccessKey],
    ]);

    this.logger.debug({
      message: 'AWS SQS configuration options',
      context: AwsConfig.name,
      options,
    });

    for (const [key, value] of options) {
      if (value === undefined) {
        this.logger.error({
          message: `Missing AWS SQS configuration: ${key}`,
          context: AwsConfig.name,
        });
        throw new Error(`Missing AWS SQS configuration: ${key}`);
      }
    }

    this.region = region!;
    this.endpoint = endpoint!;
    this.credentials = {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    };

    this.sqs = new SQSClient({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
      },
      maxAttempts: 3,
    });

    this.logger.debug({
      message: 'AWS SQS client created',
      context: AwsConfig.name,
      region,
      endpoint,
    });
  }
}
