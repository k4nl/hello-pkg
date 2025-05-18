export enum AWSConstants {
  REGION = 'AWS_REGION',
  ENDPOINT = 'AWS_ENDPOINT',
  ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID',
  SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY',
}

export enum AwsQueue {
  GATEWAY = 'gateway',
  CREATE_USER = 'create-user',
  UPDATE_USER = 'update-user',
  DELETE_USER = 'delete-user',
  GET_USER_INFO = 'get-user-info',
  TOOL_RESPONSE = 'tool-response',
}

export interface SqsTransporterOptions {
  queues_name: AwsQueue[] | AwsQueue;
  max_number_of_messages?: number;
  polling_time_seconds?: number;
}

export type QueuePayloads = {
  [AwsQueue.GATEWAY]: {};
  [AwsQueue.CREATE_USER]: {};
  [AwsQueue.UPDATE_USER]: {};
  [AwsQueue.DELETE_USER]: {};
  [AwsQueue.GET_USER_INFO]: {};
  [AwsQueue.TOOL_RESPONSE]: {};
};
