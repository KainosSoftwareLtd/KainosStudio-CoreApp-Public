import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { IDataStore } from 'core-runtime/lib/store/DataStore.js';
import envConfig from '../../config/envConfig.js';
import { logger } from 'core-runtime';

export class AzureCosmosDbStore<T extends { session_id: string; form_id: string }> implements IDataStore<T> {
  private client: CosmosClient;
  private credential: DefaultAzureCredential;
  private database;

  constructor() {
    this.credential = new DefaultAzureCredential();
    this.client = new CosmosClient({
      endpoint: envConfig.azureCosmosEndpoint,
      aadCredentials: this.credential,
    });
    this.database = this.client.database(envConfig.azureCosmosDatabase);
  }

  async saveItem(tableName: string, item: T): Promise<void> {
    try {
      const container = this.database.container(tableName);
      const itemWithId = {
        ...item,
        id: this.createCompositeKey(item.form_id, item.session_id),
      };
      logger.info('Cosmos DB upsert command for item: ' + itemWithId.id);
      await container.items.upsert(itemWithId);
    } catch (error) {
      throw new Error('Azure saveItem failed: ' + String(error));
    }
  }

  async getItem(tableName: string, key: Partial<T>): Promise<T | null> {
    try {
      const container = this.database.container(tableName);
      if (!key.session_id || !key.form_id) {
        throw new Error('Key must contain session_id and form_id properties');
      }

      const compositeId = this.createCompositeKey(key.form_id, key.session_id);
      logger.info('Cosmos DB read command for item: ' + compositeId);
      const { resource } = await container.item(compositeId, key.form_id).read<T>();
      return resource || null;
    } catch (error) {
      const cosmosError = error as Error & { code?: number };
      if (cosmosError.code === 404) return null;
      throw new Error('Azure getItem failed: ' + cosmosError.message);
    }
  }

  async removeItem(tableName: string, key: Partial<T>): Promise<void> {
    try {
      const container = this.database.container(tableName);
      if (!key.session_id || !key.form_id) {
        throw new Error('Key must contain session_id and form_id properties');
      }

      const compositeId = this.createCompositeKey(key.form_id, key.session_id);
      logger.info('Cosmos DB delete command for item: ' + compositeId);

      await container.item(compositeId, key.form_id).delete();
    } catch (error) {
      const cosmosError = error as Error & { code?: number };
      if (cosmosError.code === 404) {
        logger.info('Item not found during removal', key);
        return;
      }
      throw new Error('Azure removeItem failed: ' + String(error));
    }
  }

  private createCompositeKey(formId: string, sessionId: string): string {
    return `${formId}_${sessionId}`;
  }
}
