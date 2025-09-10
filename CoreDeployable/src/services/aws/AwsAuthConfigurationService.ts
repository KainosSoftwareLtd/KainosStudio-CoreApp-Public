import { GetObjectCommand, HeadObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';

import { IAuthConfigurationService } from '../../interfaces/IAuthConfigurationStorage.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';

export class AwsAuthConfigurationService implements IAuthConfigurationService {
  private _s3Client: S3Client;
  private _bucketName: string;

  public constructor() {
    this._s3Client = new S3Client();
    this._bucketName = envConfig.bucketName;
  }

  async hasAuthConfiguration(serviceName: string, fileName: string): Promise<boolean> {
    try {
      const objectKey = `${serviceName}/${fileName}.json`;
      
      logger.debug(`Check if configuration file: ${objectKey} exists in bucket: ${this._bucketName}`);

      const command = new HeadObjectCommand({
        Bucket: this._bucketName,
        Key: objectKey,
      });

      await this._s3Client.send(command);
      logger.debug(`File: ${objectKey} exists in bucket: ${this._bucketName}`);

      return true;
    } catch (error) {
      if ((error as S3ServiceException)?.$metadata?.httpStatusCode === 404) {
        logger.debug(`File: ${serviceName}/${fileName}.json not exists in bucket: ${this._bucketName}`);
        return false;
      } else {
        logger.error(`Unexpected error: ${error}`);
        throw error;
      }
    }
  }

  async getAuthConfiguration(serviceName: string, fileName: string): Promise<object> {
    const objectKey = `${serviceName}/${fileName}.json`;
    
    logger.debug(`Getting configuration file: ${objectKey} from bucket: ${this._bucketName}`);

    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: objectKey,
    });

    const getObjectResponse = await this._s3Client.send(command);
    if (!getObjectResponse.Body) {
      logger.error(`No body found in S3 response for key: ${objectKey}`);
      throw new Error('Configuration file is empty or missing');
    }

    const body = await getObjectResponse.Body.transformToString();
    return JSON.parse(body);
  }
}