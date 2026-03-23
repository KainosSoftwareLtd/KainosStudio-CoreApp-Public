import { HttpRequest, InvocationContext } from '@azure/functions';

import { createApp } from './index.js';
import serverlessExpress from '@codegenie/serverless-express';

const app = createApp();
const cachedServerlessExpress = serverlessExpress({ app });

export default async function (context: InvocationContext, req: HttpRequest) {
  return cachedServerlessExpress(context, req);
}
