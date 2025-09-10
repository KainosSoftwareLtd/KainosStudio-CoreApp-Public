import { IServiceRetriever } from '../../interfaces/IServiceRetriever.js';
import { Service } from 'core-runtime/lib/service/Service.js';
import fs from 'fs';
import { logger } from 'core-runtime';

export class LocalServiceRetriever implements IServiceRetriever {
  async getService(serviceId: string): Promise<Service | undefined> {
    serviceId = serviceId?.toLowerCase();

    let serviceData: Service | undefined = undefined;
    try {
      serviceData = JSON.parse(fs.readFileSync(`./services/${serviceId}.json`, 'utf8'));
    } catch (error) {
      logger.error(error);
    }

    if (serviceData === undefined) {
      logger.error(`Service ${serviceId} not found`);
      return undefined;
    }

    return serviceData as Service;
  }
}
