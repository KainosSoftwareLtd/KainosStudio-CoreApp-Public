import './config/env.js';

import { createLocalApp } from './index.js';
import envConfig from './config/envConfig.js';
import { logger } from 'core-runtime';

const app = createLocalApp();
app.listen(envConfig.port, () => {
  logger.info(`Demo server is running on http://localhost:${envConfig.port}`);
});
