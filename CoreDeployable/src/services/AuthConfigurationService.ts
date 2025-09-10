import { IAuthConfigurationService } from '../interfaces/IAuthConfigurationStorage.js';
import envConfig from '../config/envConfig.js';
import { getCloudServices } from '../container/CloudServicesRegistry.js';
import { logger } from 'core-runtime';

export class AuthConfigurationService {
  private _authConfigurationStorage: IAuthConfigurationService;
  private _authConfigFileName: string;

  public constructor() {
    this._authConfigurationStorage = getCloudServices().authConfigurationStorage;
    this._authConfigFileName = envConfig.authConfigFileName;
  }

  public async hasConfiguration(serviceName: string) {
    if (envConfig.useLocalServices) {
      logger.debug('Local services are set to true - skipping authentication process');
      return false;
    }

    return await this._authConfigurationStorage.hasAuthConfiguration(serviceName, this._authConfigFileName);
  }

  public async getConfiguration(serviceName: string) {
    return await this._authConfigurationStorage.getAuthConfiguration(serviceName, this._authConfigFileName);
  }
}
