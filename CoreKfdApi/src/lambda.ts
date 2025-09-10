import { createApp } from './index.js';
import serverlessExpress from "@codegenie/serverless-express";

const app = createApp();

export const handler = serverlessExpress({ app });