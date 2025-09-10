import { Service } from 'core-runtime/lib/service/Service.js';

export interface IServiceRetriever {
  getService(serviceId: string): Promise<Service | undefined>;
}
