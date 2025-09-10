import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { IServiceRetriever } from '../../interfaces/IServiceRetriever.js';
import { Service } from 'core-runtime/lib/service/Service.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';
import { streamToBuffer } from '../../utils/streamUtils.js';

export class AzureStorageService implements IServiceRetriever {
  async getService(serviceId: string): Promise<Service | undefined> {
    try {
      const storageAccountUrl = `https://${envConfig.azureStorageAccount}.blob.core.windows.net`;
      const credential = new DefaultAzureCredential();
      const blobServiceClient = new BlobServiceClient(storageAccountUrl, credential);
      const containerName = envConfig.azureStorageContainer;

      serviceId = serviceId?.toLowerCase();
      const blobName = `${serviceId}/${serviceId}.json`;
      logger.debug(`Getting service file: ${blobName} from container: ${containerName}`);

      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadBlockBlobResponse = await blockBlobClient.download();
      const downloaded = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody || null)).toString();
      
      return JSON.parse(downloaded) as Service;
    } catch (error) {
      logger.error(error);
      return undefined;
    }
  }
}
