import { AwsAuthConfigurationService } from '../services/aws/AwsAuthConfigurationService.js';
import { AwsBucketService } from '../services/aws/AwsBucketService.js';
import { AwsDynamoDbStore } from '../services/aws/AwsDynamoDbStore.js';
import { AwsFileService } from '../services/aws/AwsFileService.js';
import { AzureAuthConfigurationService } from '../services/azure/AzureAuthConfigurationService.js';
import { AzureCosmosDbStore } from '../services/azure/AzureCosmosDbStore.js';
import { AzureFileService } from '../services/azure/AzureFileService.js';
import { AzureStorageService } from '../services/azure/AzureStorageService.js';
import { CloudProvider } from '../utils/cloudProviders.js';
import { FormSession } from 'core-runtime/lib/store/FormSession.js';
import { ICloudServices } from './ICloudServices.js';

export class CloudServicesFactory {
  static createServices(provider: string): ICloudServices {
    switch (provider) {
      case CloudProvider.azure: {
        return {
          fileService: new AzureFileService(),
          storeService: new AzureCosmosDbStore<FormSession>(),
          serviceRetriever: new AzureStorageService(),
          authConfigurationStorage: new AzureAuthConfigurationService(),
        };
      }
      case CloudProvider.aws: {
        return {
          fileService: new AwsFileService(),
          storeService: new AwsDynamoDbStore<FormSession>(),
          serviceRetriever: new AwsBucketService(),
          authConfigurationStorage: new AwsAuthConfigurationService(),
        };
      }
      default:
        throw new Error(`Unsupported cloud provider: ${provider}`);
    }
  }
}
