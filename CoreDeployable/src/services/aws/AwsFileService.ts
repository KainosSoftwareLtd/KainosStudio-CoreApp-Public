import { FileServiceResult, IFileService, PresignedPost } from 'core-runtime/lib/files/FileService.js';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { CloudProvider } from '../../utils/cloudProviders.js';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import envConfig from '../../config/envConfig.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from 'core-runtime';

export class AwsFileService implements IFileService {
  async getPresignedUrlForDownload(key: string): Promise<FileServiceResult<string>> {
    try {
      const s3Client = new S3Client();
      const command = new GetObjectCommand({
        Bucket: envConfig.bucketNameForFormFiles,
        Key: key,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 });

      return { isSuccesfull: true, value: url };
    } catch (err) {
      logger.error(err);

      return {
        isSuccesfull: false,
        error: 'Unexpected error while getting signed url for download.',
      };
    }
  }

  async getPresignedPost(key: string, maxFileSize?: number): Promise<FileServiceResult<PresignedPost>> {
    try {
      const maxSize = maxFileSize
        ? Math.min(maxFileSize, envConfig.maxAllowedFileSizeToUpload)
        : envConfig.maxAllowedFileSizeToUpload;
      const maxSizeAsBytes = Math.floor(maxSize * (1024 * 1024));

      const s3Client = new S3Client();
      const presignedPost = await createPresignedPost(s3Client, {
        Bucket: envConfig.bucketNameForFormFiles,
        Key: key,
        Conditions: [
          { bucket: envConfig.bucketNameForFormFiles },
          ['starts-with', '$key', key],
          ['content-length-range', 1, maxSizeAsBytes],
        ],
        Expires: 60,
      });

      return { isSuccesfull: true, value: { ...presignedPost, cloudProvider: CloudProvider.aws } };
    } catch (err) {
      logger.error(err);

      return {
        isSuccesfull: false,
        error: 'Unexpected error while getting presigned post.',
      };
    }
  }

  getStorageUrl(): string {
    return `https://${envConfig.bucketNameForFormFiles}.s3.${envConfig.bucketRegionForFormFiles}.amazonaws.com`;
  }
}
