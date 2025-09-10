import { AwsBucketService } from './aws/AwsBucketService.js';
import { AzureStorageService } from './azure/AzureStorageService.js';
import { CloudProvider } from '../utils/cloudProviders.js';
import { IStorageService } from '../interfaces/IStorageService.js';
import envConfig from '../config/envConfig.js';

export class StorageServiceFactory {
  static createStorageService(): IStorageService {
    const provider = envConfig.cloudProvider;

    switch (provider) {
      case CloudProvider.aws:
        return new AwsBucketService();
      case CloudProvider.azure:
        return new AzureStorageService();
      default:
        throw new Error(`Unsupported cloud provider: ${provider}`);
    }
  }
}
