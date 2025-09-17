import { allowedCloudProviders } from '../utils/cloudProviders.js';

const envConfig = {
  get bucketName() {
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error('BUCKET_NAME environment variable is not set');
    }
    return bucketName;
  },
  get port() {
    return process.env.PORT || 3002;
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
  get cloudProvider() {
    const provider = (process.env.CLOUD_PROVIDER || '').toLowerCase();
    if (!allowedCloudProviders.includes(provider)) {
      throw new Error(`CLOUD_PROVIDER environment variable must be one of: ${allowedCloudProviders.join(', ')}`);
    }
    return provider;
  },
  get apiKeys() {
    const keys = process.env.API_KEYS;
    if (!keys || keys.trim() === '') {
      return [];
    }
    return keys.split(',').map(key => key.trim()).filter(key => key.length > 0);
  },
};

export default envConfig;
