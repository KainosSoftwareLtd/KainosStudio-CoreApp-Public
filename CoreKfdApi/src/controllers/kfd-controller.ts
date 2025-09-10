import { StorageServiceFactory } from '../services/StorageServiceFactory.js';
import { appLogger } from '../logConfig.js';
import express from 'express';
import { validateKfd } from '../services/kfd-validator.js';

const authConfigFileName = process.env.AUTH_CONFIG_FILE_NAME || 'auth';

export async function putKfd(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const storageService = StorageServiceFactory.createStorageService();

    const requestBody = req.body;
    appLogger.debug('Request: ' + JSON.stringify(requestBody));

    let serviceName = requestBody.name;
    if (!serviceName) {
      return res.status(400).json({ message: "Please specify field 'name' for KFD file" });
    } else {
      if (!/^[a-zA-Z0-9- ]*$/.test(serviceName)) {
        return res.status(400).json({ message: "Field 'name' can only include letters, numbers, spaces and dashes." });
      }
    }

    serviceName = serviceName.toLowerCase();

    const fileContent = requestBody.content;
    if (!fileContent) {
      return res.status(400).json({ message: "Please specify field 'content' for KFD file" });
    }

    const errors = validateKfd(fileContent);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation errors', errors: errors });
    }

    const authFileName = authConfigFileName.toLowerCase();
    const authenticationSection = fileContent.authentication;
    if (authenticationSection !== undefined) {
      try {
        await storageService.putObject(`${serviceName}/${authFileName}.json`, JSON.stringify(authenticationSection), 'application/json');
      } catch (err) {
        appLogger.error(err);
        return res.status(500).json({ message: `Failed to add ${authFileName} file for ${serviceName} to storage.` });
      }
    } else {
      try {
        await storageService.deleteObject(`${serviceName}/${authFileName}.json`);
      } catch (err) {
        appLogger.error(err);
        return res.status(500).json({ message: `Failed to delete ${authFileName} file for ${serviceName} from storage.` });
      }
    }

    try {
      await storageService.putObject(`${serviceName}/${serviceName}.json`, JSON.stringify(fileContent), 'application/json');
    } catch (err) {
      appLogger.error(err);
      return res.status(500).json({ message: `Failed to save KFD file for ${serviceName} to storage.` });
    }

    return res.status(200).json({ message: `${serviceName} KFD saved successfully!` });
  } catch(e) {
    next(e);
  }
}

export async function deleteKfd(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const storageService = StorageServiceFactory.createStorageService();

    const { id } = req.params;
    const serviceName = decodeURI(id).toLowerCase();

    try {
      const folder = `${serviceName}/`;

      appLogger.info(`Deleting files in the ${folder} from storage.`);

      const objectKeys = await storageService.listObjects(folder);

      if (objectKeys.length === 0) {
        appLogger.info('No objects found in the folder.');
        return res.status(404).end();
      }

      await storageService.deleteObjects(folder);

      appLogger.info(`Successfully deleted ${objectKeys.length} objects from storage`);

      return res.status(204).end();
    } catch (err) {
      appLogger.error('Error deleting folder:', err);
      return res.status(500).json({ message: `Failed to delete files for ${serviceName} from storage because of unexpected error.` });
    }
  } catch(e) {
    next(e);
  }
}
