import { FormSession } from 'core-runtime/lib/store/FormSession.js';
import { IAuthConfigurationService } from '../interfaces/IAuthConfigurationStorage.js';
import { IDataStore } from 'core-runtime/lib/store/DataStore.js';
import { IFileService } from 'core-runtime/lib/files/FileService.js';
import { IServiceRetriever } from '../interfaces/IServiceRetriever.js';

export interface ICloudServices {
  readonly fileService: IFileService;
  readonly storeService: IDataStore<FormSession>;
  readonly serviceRetriever: IServiceRetriever;
  readonly authConfigurationStorage: IAuthConfigurationService;
}
