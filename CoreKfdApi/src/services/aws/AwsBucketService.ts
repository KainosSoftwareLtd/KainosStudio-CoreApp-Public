import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { IStorageService } from '../../interfaces/IStorageService.js';
import envConfig from '../../config/envConfig.js';

export class AwsBucketService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client();
    this.bucketName = envConfig.bucketName;
  }

  async putObject(key: string, content: string, contentType: string = 'application/json'): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: content,
      ContentType: contentType,
    });
    await this.s3Client.send(command);
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  async deleteObjects(prefix: string): Promise<void> {
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });
    
    const listedObjects = await this.s3Client.send(listCommand);
    
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: this.bucketName,
      Delete: {
        Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key! })),
        Quiet: true,
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await this.s3Client.send(deleteCommand);
  }

  async listObjects(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });
    
    const result = await this.s3Client.send(command);
    return result.Contents?.map(obj => obj.Key!).filter(key => key) || [];
  }
}
