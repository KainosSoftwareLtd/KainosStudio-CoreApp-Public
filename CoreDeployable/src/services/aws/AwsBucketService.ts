import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { IServiceRetriever } from '../../interfaces/IServiceRetriever.js';
import { Service } from 'core-runtime/lib/service/Service.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';

export class AwsBucketService implements IServiceRetriever {
  async getService(serviceId: string): Promise<Service | undefined> {
    try {
      const s3Client = new S3Client();
      const bucketName = envConfig.bucketName;

      serviceId = serviceId?.toLowerCase();
      const objectKey = `${serviceId}/${serviceId}.json`;
      logger.debug(`Getting service file: ${objectKey} from bucket: ${bucketName}`);
      const getObjectResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        }),
      );

      const bodyString = await getObjectResponse.Body?.transformToString();
      if (!bodyString) {
        return undefined;
      }

      const json = JSON.parse(bodyString);
      return json as Service;
    } catch (error) {
      logger.error(error);
      return undefined;
    }
  }
}
