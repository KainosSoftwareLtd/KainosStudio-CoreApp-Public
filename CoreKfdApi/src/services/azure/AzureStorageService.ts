import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

import { DefaultAzureCredential } from '@azure/identity';
import { IStorageService } from '../../interfaces/IStorageService.js';
import envConfig from '../../config/envConfig.js';

export class AzureStorageService implements IStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private containerName: string;
  private credential: DefaultAzureCredential;

  constructor() {
    const storageAccountUrl = `https://${envConfig.azureStorageAccount}.blob.core.windows.net`;

    this.credential = new DefaultAzureCredential();
    this.blobServiceClient = new BlobServiceClient(storageAccountUrl, this.credential);
    this.containerName = envConfig.azureStorageContainer;
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  async putObject(key: string, content: string, contentType: string = 'application/json'): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.upload(content, Buffer.byteLength(content), {
      blobHTTPHeaders: { blobContentType: contentType },
    });
  }

  async deleteObject(key: string): Promise<void> {
    const blobClient = this.containerClient.getBlobClient(key);
    await blobClient.deleteIfExists();
  }

  async deleteObjects(prefix: string): Promise<void> {
    const blobs = this.containerClient.listBlobsFlat({ prefix });
    const deletePromises: Promise<void>[] = [];

    for await (const blob of blobs) {
      deletePromises.push(this.deleteObject(blob.name));
    }

    await Promise.all(deletePromises);
  }

  async listObjects(prefix: string): Promise<string[]> {
    const blobs = this.containerClient.listBlobsFlat({ prefix });
    const blobNames: string[] = [];

    for await (const blob of blobs) {
      blobNames.push(blob.name);
    }

    return blobNames;
  }
}
