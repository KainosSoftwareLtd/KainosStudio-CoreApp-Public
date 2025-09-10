import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { FileServiceResult, IFileService, PresignedPost } from 'core-runtime/lib/files/FileService.js';

import { CloudProvider } from '../../utils/cloudProviders.js';
import { DefaultAzureCredential } from '@azure/identity';
import envConfig from '../../config/envConfig.js';

export class AzureFileService implements IFileService {
  private blobServiceClient: BlobServiceClient;
  private credential: DefaultAzureCredential;
  private blobBaseUrl: string;
  private _storageAccountUrl: string;

  constructor() {
    this._storageAccountUrl = `https://${envConfig.azureStorageAccountForFormFiles}.blob.core.windows.net`;

    this.credential = new DefaultAzureCredential();
    this.blobServiceClient = new BlobServiceClient(this._storageAccountUrl, this.credential);
    this.blobBaseUrl = `${this._storageAccountUrl}/${envConfig.azureStorageContainerForFormFiles}`;
  }

  async getPresignedPost(key: string, maxFileSize?: number): Promise<FileServiceResult<PresignedPost>> {
    try {
      // Note: Azure SAS tokens don't support content-length constraints like AWS S3
      // File size validation should be handled client-side or server-side after upload
      const maxSize = maxFileSize
        ? Math.min(maxFileSize, envConfig.maxAllowedFileSizeToUpload)
        : envConfig.maxAllowedFileSizeToUpload;

      const userDelegationKey = await this.blobServiceClient.getUserDelegationKey(
        new Date(),
        new Date(Date.now() + 3600 * 24 * 1000),
      );
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: envConfig.azureStorageContainerForFormFiles,
          blobName: key,
          permissions: BlobSASPermissions.parse('cw'),
          expiresOn: new Date(Date.now() + 3600 * 24 * 1000),
          protocol: SASProtocol.Https,
        },
        userDelegationKey,
        envConfig.azureStorageAccountForFormFiles,
      ).toString();
      const url = `${this.blobBaseUrl}/${key}?${sasToken}`;
      return {
        isSuccesfull: true,
        value: {
          url: url,
          fields: { maxFileSize: maxSize.toString() },
          cloudProvider: CloudProvider.azure,
        },
      };
    } catch (error) {
      return { isSuccesfull: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async getPresignedUrlForDownload(key: string): Promise<FileServiceResult<string>> {
    try {
      const userDelegationKey = await this.blobServiceClient.getUserDelegationKey(
        new Date(),
        new Date(Date.now() + 3600 * 24 * 1000),
      );
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: envConfig.azureStorageContainerForFormFiles,
          blobName: key,
          permissions: BlobSASPermissions.parse('r'),
          expiresOn: new Date(Date.now() + 3600 * 24 * 1000),
          protocol: SASProtocol.Https,
        },
        userDelegationKey,
        envConfig.azureStorageAccountForFormFiles,
      ).toString();
      const url = `${this.blobBaseUrl}/${key}?${sasToken}`;
      return { isSuccesfull: true, value: url };
    } catch (error) {
      return { isSuccesfull: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  getStorageUrl(): string {
    return this._storageAccountUrl;
  }
}