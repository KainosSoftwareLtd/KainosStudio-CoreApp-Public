import * as consts from './consts.js'
import * as context from './context/index.js';
import * as creator from './creator/index.js';
import * as elements from './elements/index.js';
import * as files from './files/index.js';
import * as rendering from './rendering/index.js';
import * as service from './service/index.js';

import { appLogger } from './logConfig.js';

export { context, creator, service, rendering, elements, files, consts };

export const logger = appLogger;

export default {
  context,
  creator,
  service,
  rendering,
  elements,
  logger,
  files,
  consts
};

logger.info('Core runtime loaded');
