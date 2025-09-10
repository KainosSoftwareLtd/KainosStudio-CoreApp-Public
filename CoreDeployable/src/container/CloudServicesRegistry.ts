import { CloudServicesFactory } from './CloudServicesFactory.js';
import { ICloudServices } from './ICloudServices.js';

/**
 * Singleton container for managing cloud services.
 * Services are initialized once and reused throughout the application lifecycle.
 */
class CloudServicesRegistry {
  private _services: ICloudServices | null = null;

  initialize(provider: string): void {
    if (this._services) {
      throw new Error('Cloud services have already been initialized');
    }
    this._services = CloudServicesFactory.createServices(provider);
  }

  getServices(): ICloudServices {
    if (!this._services) {
      throw new Error('Cloud services have not been initialized. Call initializeCloudServices() first.');
    }
    return this._services;
  }
}

const registry = new CloudServicesRegistry();

export function initializeCloudServices(provider: string): void {
  registry.initialize(provider);
}

export function getCloudServices(): ICloudServices {
  return registry.getServices();
}
