import { createCloudApp } from './index.js';
import serverlessExpress from '@codegenie/serverless-express';

const app = await createCloudApp();

export const handler = serverlessExpress({ app });
