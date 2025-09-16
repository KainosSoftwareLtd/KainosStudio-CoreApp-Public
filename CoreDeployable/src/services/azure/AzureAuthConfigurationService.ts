import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { IAuthConfigurationService } from '../../interfaces/IAuthConfigurationStorage.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';
import { streamToBuffer } from '../../utils/streamUtils.js';

export class AzureAuthConfigurationService implements IAuthConfigurationService {
  private _storageAccountUrl: string;
  private _credential: DefaultAzureCredential;
  private _containerName: string;

  public constructor() {
    this._storageAccountUrl = `https://${envConfig.azureStorageAccount}.blob.core.windows.net`;
    this._credential = new DefaultAzureCredential();
    this._containerName = envConfig.azureStorageContainer;
  }

  async hasAuthConfiguration(serviceName: string, fileName: string): Promise<boolean> {
    try {
      const blobServiceClient = new BlobServiceClient(this._storageAccountUrl, this._credential);
      serviceName = serviceName?.toLowerCase();
      const blobName = `${serviceName}/${fileName}.json`;
      
      logger.debug(`Check if configuration file: ${blobName} exists in container: ${this._containerName}`);

      const containerClient = blobServiceClient.getContainerClient(this._containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const properties = await blockBlobClient.getProperties();
      logger.debug(`File: ${blobName} exists in container: ${this._containerName}`);
      
      return properties !== undefined;
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 404) {
        logger.debug(`File: ${serviceName}/${fileName}.json not exists in container: ${this._containerName}`);
        return false;
      } else {
        logger.error(`Unexpected error: ${error}`);
        throw error;
      }
    }
  }

  async getAuthConfiguration(serviceName: string, fileName: string): Promise<object> {
    const blobServiceClient = new BlobServiceClient(this._storageAccountUrl, this._credential);
    serviceName = serviceName?.toLowerCase();
    const blobName = `${serviceName}/${fileName}.json`;
    
    logger.debug(`Getting configuration file: ${blobName} from container: ${this._containerName}`);

    const containerClient = blobServiceClient.getContainerClient(this._containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const downloadBlockBlobResponse = await blockBlobClient.download();
    if (!downloadBlockBlobResponse.readableStreamBody) {
      logger.error(`No body found in Azure blob response for key: ${blobName}`);
      throw new Error('Configuration file is empty or missing');
    }
    
    const downloaded = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
    return JSON.parse(downloaded);
  }
}
