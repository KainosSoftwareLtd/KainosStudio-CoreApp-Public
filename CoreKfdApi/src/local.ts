import './config/env.js';

import { appLogger } from './logConfig.js';
import { createApp } from './index.js';
import envConfig from './config/envConfig.js';

const app = createApp();
app.listen(envConfig.port, () => {
  appLogger.info(`KFD API server is running on http://localhost:${envConfig.port}`);
});
