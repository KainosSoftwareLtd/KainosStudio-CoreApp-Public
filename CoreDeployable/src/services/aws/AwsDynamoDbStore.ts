import {
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { IDataStore } from 'core-runtime/lib/store/DataStore.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';

export class AwsDynamoDbStore<T extends object> implements IDataStore<T> {
  private client: DynamoDBClient;

  constructor() {
    let config: DynamoDBClientConfig = {};
    if (envConfig.useLocalDynamoDb) {
      config = {
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
        region: 'local',
        endpoint: 'http://localhost:8000',
        profile: undefined,
      };
    }
    this.client = new DynamoDBClient(config);
  }

  async saveItem(tableName: string, item: T): Promise<void> {
    try {
      const marshalled = marshall(item);
      const command = new PutItemCommand({
        TableName: tableName,
        Item: marshalled,
      });

      logger.debug('DynamoDB put command:', command);

      await this.client.send(command);
    } catch (error) {
      logger.error('Error saving item to DynamoDB:', error);
      throw error;
    }
  }

  async getItem(tableName: string, key: Partial<T>): Promise<T | null> {
    try {
      const command = new GetItemCommand({
        TableName: tableName,
        Key: marshall(key),
      });

      logger.debug('DynamoDB get command:', command);

      const response = await this.client.send(command);
      if (response.Item) {
        return unmarshall(response.Item) as T;
      }
      return null;
    } catch (error) {
      logger.error('Error getting item from DynamoDB:', error);
      throw error;
    }
  }

  async removeItem(tableName: string, key: Partial<T>): Promise<void> {
    try {
      const command = new DeleteItemCommand({
        TableName: tableName,
        Key: marshall(key),
      });

      logger.debug('DynamoDB delete command:', command);

      await this.client.send(command);
    } catch (error) {
      logger.error('Error removing item from DynamoDB:', error);
      throw error;
    }
  }
}
