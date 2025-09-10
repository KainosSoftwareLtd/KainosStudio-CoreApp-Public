export interface IAuthConfigurationService {
  hasAuthConfiguration(serviceName: string, fileName: string): Promise<boolean>;
  getAuthConfiguration(serviceName: string, fileName: string): Promise<object>;
}
