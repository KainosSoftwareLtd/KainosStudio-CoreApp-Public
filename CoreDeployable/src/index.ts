import { getCloudServices, initializeCloudServices } from './container/CloudServicesRegistry.js';
import { getStaticPaths, rendererFunc } from './utils/designSystemUtils.js';

import { LocalServiceRetriever } from './services/local/LocalServiceRetriever.js';
import { creator } from 'core-runtime';
import ensureLoggedInMiddleware from './middlewares/authMiddleware.js';
import envConfig from './config/envConfig.js';
import express from 'express';
import { expressConfiguration } from './config/expressConfiguration.js';

export async function createCloudApp(): Promise<express.Express> {
  initializeCloudServices(envConfig.cloudProvider);
  const { fileService, storeService, serviceRetriever } = getCloudServices();

  const creatorInstance = new creator.Creator(serviceRetriever.getService, rendererFunc, fileService, storeService, []);
  return await createApp(creatorInstance);
}

export async function createLocalApp(): Promise<express.Express> {
  initializeCloudServices(envConfig.cloudProvider);
  const { fileService, storeService, serviceRetriever } = getCloudServices();
  const retriever = envConfig.useLocalServices ? new LocalServiceRetriever() : serviceRetriever;

  const staticPaths = getStaticPaths();
  const creatorInstance = new creator.Creator(
    retriever.getService,
    rendererFunc,
    fileService,
    storeService,
    staticPaths,
  );

  return await createApp(creatorInstance);
}

async function createApp(creatorInstance: creator.Creator): Promise<express.Express> {
  return await creatorInstance.express(expressConfiguration, ensureLoggedInMiddleware);
}
