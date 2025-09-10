import { allowedCloudProviders } from '../utils/cloudProviders.js';

const envConfig = {
  get sessionSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error('SESSION_SECRET environment variable is not set');
    }
    return secret;
  },
  get bucketName() {
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error('BUCKET_NAME environment variable is not set');
    }
    return bucketName;
  },
  get authConfigFileName() {
    const fileName = process.env.AUTH_CONFIG_FILE_NAME;
    if (!fileName) {
      throw new Error('AUTH_CONFIG_FILE_NAME environment variable is not set');
    }
    return fileName;
  },
  get port() {
    return process.env.PORT || 3000;
  },
  get useLocalServices(): boolean {
    return process.env.USE_LOCAL_SERVICES === 'true';
  },
  get useLocalDynamoDb(): boolean {
    return process.env.USE_LOCAL_DYNAMODB === 'true';
  },
  get bucketNameForFormFiles() {
    const bucketName = process.env.BUCKET_NAME_FOR_FORM_FILES;
    if (!bucketName) {
      throw new Error('BUCKET_NAME_FOR_FORM_FILES environment variable is not set');
    }
    return bucketName;
  },
  get bucketRegionForFormFiles() {
    const region = process.env.BUCKET_REGION_FOR_FORM_FILES;
    if (!region) {
      throw new Error('BUCKET_REGION_FOR_FORM_FILES environment variable is not set');
    }
    return region;
  },
  get maxAllowedFileSizeToUpload() {
    return process.env.MAX_ALLOWED_FILE_SIZE_TO_UPLOAD ? parseFloat(process.env.MAX_ALLOWED_FILE_SIZE_TO_UPLOAD) : 100;
  },
  get azureStorageAccount() {
    const value = process.env.AZURE_STORAGE_ACCOUNT;
    if (!value) throw new Error('AZURE_STORAGE_ACCOUNT environment variable is not set');
    return value;
  },
  get azureStorageContainer() {
    const value = process.env.AZURE_STORAGE_CONTAINER;
    if (!value) throw new Error('AZURE_STORAGE_CONTAINER environment variable is not set');
    return value;
  },
  get azureStorageAccountForFormFiles() {
    const value = process.env.AZURE_STORAGE_ACCOUNT_FOR_FORM_FILES;
    if (!value) throw new Error('AZURE_STORAGE_ACCOUNT_FOR_FORM_FILES environment variable is not set');
    return value;
  },
  get azureStorageContainerForFormFiles() {
    const value = process.env.AZURE_STORAGE_CONTAINER_FOR_FORM_FILES;
    if (!value) throw new Error('AZURE_STORAGE_CONTAINER_FOR_FORM_FILES environment variable is not set');
    return value;
  },
  get azureCosmosEndpoint() {
    const value = process.env.AZURE_COSMOS_ENDPOINT;
    if (!value) throw new Error('AZURE_COSMOS_ENDPOINT environment variable is not set');
    return value;
  },
  get azureCosmosDatabase() {
    return process.env.AZURE_COSMOS_DATABASE || 'CoreDatabase';
  },
  get cloudProvider() {
    const provider = (process.env.CLOUD_PROVIDER || '').toLowerCase();
    if (!allowedCloudProviders.includes(provider)) {
      throw new Error(`CLOUD_PROVIDER environment variable must be one of: ${allowedCloudProviders.join(', ')}`);
    }
    return provider;
  },
};

export default envConfig;
