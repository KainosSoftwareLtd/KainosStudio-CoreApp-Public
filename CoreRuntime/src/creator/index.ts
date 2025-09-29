import { Action, FileUploadElement, ValueElement } from '../service/Element.js';
import { RenderControl, Renderer } from '../rendering/index.js';
import { allowedOrigin, checkOrigin } from './CheckOriginMiddleware.js';
import { apiKeyHeaderKeyName, langKey, referenceNumberFieldName, sessionIdKey } from '../consts.js';
import { getErrorPageService, getNotFoundService } from '../service/DefinedKfdServices.js';

import { ConditionalNextPage } from '../service/Page.js';
import { Context } from '../context/index.js';
import { ContextBuilder } from '../context/ContextBuilder.js';
import { Enricher } from '../context/Enricher.js';
import { FormSession } from '../store/FormSession.js';
import { FormSessionService } from '../store/FormSessionService.js';
import { IDataStore } from '../store/DataStore.js';
import { IFileService } from '../files/FileService.js';
import { ObjectBuilder } from './ObjectBuilder.js';
import { Service } from '../service/Service.js';
import SubmitButton from '../elements/SubmitButton.js';
import { Validator } from '../context/Validator.js';
import { appLogger } from '../logConfig.js';
import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import { findEndpointByOperationId } from '../service/OpenApiSpecificationHelpers.js';
import jmespath from 'jmespath';
import { logger } from '../index.js';
import path from 'path';

const reservedResourceNames = ['assets', 'public', 'favicon.ico', '.well-known'];

export class Creator {
  private serviceRetriever: (serviceId: string) => Promise<Service | undefined>;
  private app: express.Express;
  private enricher: Enricher;
  private validator: Validator;
  private renderControl: RenderControl;
  private objectBuilder: ObjectBuilder;
  private fileService: IFileService;
  private staticPaths: { key: string; value: string }[];
  private formSessionService: FormSessionService;
  private contextBuilder: ContextBuilder;

  public constructor(
    serviceRetriever: (serviceId: string) => Promise<Service | undefined>,
    rendererFunc: (context: Context) => Renderer,
    fileService: IFileService,
    dataStore: IDataStore<FormSession>,
    staticPaths: { key: string; value: string }[],
  ) {
    this.serviceRetriever = serviceRetriever;
    this.enricher = new Enricher();
    this.validator = new Validator();
    this.renderControl = new RenderControl(rendererFunc);
    this.objectBuilder = new ObjectBuilder();
    this.app = express();
    this.fileService = fileService;
    this.staticPaths = staticPaths;
    this.formSessionService = new FormSessionService(dataStore);
    this.contextBuilder = new ContextBuilder(this.formSessionService);
  }

  private getFormService = async (form: string): Promise<Service> => {
    let service = await this.serviceRetriever(form);
    if (service === undefined) {
      service = getNotFoundService();
    }

    return service;
  };

  public express(
    preConfigCB?: (app: express.Express) => void,
    authMiddleware?: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>,
  ): express.Express {
    if (preConfigCB) {
      preConfigCB(this.app);
    }

    if (!authMiddleware) {
      logger.info('not defined auth middleware');
      authMiddleware = async function (_req: express.Request, _res: express.Response, next: express.NextFunction) {
        next();
      };
    }

    this.configureStaticPaths();
    this.configureApp(authMiddleware);
    return this.app;
  }

  private configureApp = (
    authMiddleware: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>,
  ) => {
    logger.info(`environment variable: NODE_DEV=${process.env.NODE_ENV}`);
    logger.info(`environment variable: LOG_LEVEL=${process.env.LOG_LEVEL}`);

    this.app.get('/', this.rootGetHandler);
    this.app.get(
      '/api/getPresignedPost',
      cors({ origin: allowedOrigin }),
      checkOrigin,
      this.apiGetPresignedPostHandler,
    );
    this.app.get('/:form', authMiddleware, this.formRootGetHandler);
    this.app.get('/:form/:page', authMiddleware, this.pageGetHandler);
    this.app.post('/:form/:page', authMiddleware, this.pagePostHandler);

    this.app.get('/:form/*/*', async (req, res, next) => {
      const form = req.params.form;
      if (reservedResourceNames.includes(form)) {
        return next();
      }
      const service = await this.getFormService(form);
      const context = await this.contextBuilder.build(req, service);
      res.status(404).send(this.renderControl.renderDocument(context));
    });

    // log static content delivery
    this.app.use(
      function (req, res, next) {
        logger.info(req.originalUrl);
        next();
      },
      express.static(path.dirname(fileURLToPath(import.meta.url))),
    );

    this.app.use(this.customErrorHandler);
  };

  private configureStaticPaths = () => {
    for (const slug of this.staticPaths) {
      logger.info(`Adding static path : ${slug.key} pointing to ${slug.value}`);
      this.app.use(slug.key, express.static(slug.value));
    }
  };

  private apiGetPresignedPostHandler = async (req: express.Request, res: express.Response) => {
    try {
      const sessionId = req.query['sessionId']?.toString();
      if (!sessionId) {
        return res.status(400).json({ error: 'Invalid session' });
      }

      const fileName = req.query['fileName']?.toString();
      if (!fileName) {
        return res.status(400).json({ error: 'Invalid file name' });
      }

      const serviceName = req.query['serviceName']?.toString();
      if (!serviceName) {
        return res.status(400).json({ error: 'Invalid service name' });
      }

      const fileUploadElementId = req.query['elementId']?.toString();
      if (!fileUploadElementId) {
        return res.status(400).json({ error: 'Invalid element id' });
      }

      const unencodedServiceName = decodeURIComponent(serviceName);
      const service = await this.serviceRetriever(unencodedServiceName);
      if (!service) {
        return res.status(500).json({ error: 'Failed to get service' });
      }

      const unencodedFileUploadElementId = decodeURIComponent(fileUploadElementId);
      const context = await this.contextBuilder.build(req, service, true);
      const fileInput = (context.allElements?.filter((e) => e.type === 'FileUpload') as FileUploadElement[]).find(
        (element) => element.name === unencodedFileUploadElementId,
      );

      if (!fileInput) {
        return res.status(500).json({ error: 'Failed to find file upload element' });
      }

      const unencodedFileName = decodeURIComponent(fileName);
      const result = await this.fileService.getPresignedPost(
        `${sessionId}/${unencodedFileName}`,
        fileInput.maxFileSize,
      );

      if (result.isSuccesfull) {
        return res.status(200).json(result.value);
      } else {
        return res.status(500).json({ error: result.error });
      }
    } catch (e) {
      appLogger.error(e);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  };

  private rootGetHandler = (req: express.Request, res: express.Response) => {
    const defaultForm = '/form';
    logger.info(`Root page requested, redirecting browser to default form: ${defaultForm}`);
    return res.redirect(defaultForm);
  };

  private formRootGetHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const form = req.params.form;
      if (reservedResourceNames.includes(form)) {
        return;
      }

      const service = await this.getFormService(form);

      const firstPageUrl = `/${req.params.form}/${service.firstPage}`;
      logger.info('Root page requested, redirecting browser to first page: ' + firstPageUrl);
      return res.redirect(firstPageUrl);
    } catch (error) {
      next(error);
    }
  };

  private pageGetHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const form = req.params.form;
      if (reservedResourceNames.includes(form)) {
        return;
      }

      const service = await this.getFormService(form);

      logger.info(`GET: ${form}/${req.params.page}`);
      const context = await this.contextBuilder.build(req, service);
      if (!context.isValid()) {
        const firstPageUrl = `/${form}/${service.firstPage}`;
        logger.debug('invalid context, redirecting to : ' + firstPageUrl);
        return res.redirect(firstPageUrl);
      }

      this.enricher.enrichPage(context.page, context);
      this.enricher.enrichSummaryElements(context.page, context);
      this.createDataCookie(context, res);
      const document = this.renderControl.renderDocument(context);
      logger.debug(`get request successful, rendering page : ${req.params.page}`);

      res.send(document);
    } catch (error) {
      next(error);
    }
  };

  private pagePostHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const form = req.params.form;
      const service = await this.getFormService(form);

      logger.info(`POST: ${req.params.page} : ` + JSON.stringify(req.body));
      const context = await this.contextBuilder.build(req, service);
      if (!context.isValid()) {
        const firstPageUrl = `/${form}/${service.firstPage}`;
        logger.debug('invalid context, redirecting to : ' + firstPageUrl);
        return res.redirect(firstPageUrl);
      }

      const sessionId = context.data[sessionIdKey];

      let pageAction;
      if (context.data.action) {
        pageAction = (context.page.allElements?.filter((e) => e.type === 'SubmitButton') as SubmitButton[]).find(
          (e) => e.action?.value === context.data.action,
        )?.action;
      }

      try {
        this.enricher.enrichPage(context.page, context);
        await this.validator.validatePage(context.page, context);
      } catch (error: any) {
        logger.debug('error during validation : ' + error.toString());
        context.page.valid = false;
        context.page.invalid = true;
      }

      let shouldSaveSession = true;
      if (context.page.valid && pageAction && pageAction.operation) {
        logger.info('Form valid and complete, submitting data to service endpoint');
        logger.info('Data submitted: ' + JSON.stringify(context.data));

        const endpoint = findEndpointByOperationId(service.apiServiceDefinition, pageAction.operation);
        if (!endpoint) {
          throw new Error('Endpoint is not defined for operation: ' + pageAction.operation);
        }

        const apiMapping = service.apiMappings[pageAction.operation];

        // it is a workaround because date is split on 3 fields 'field-name-day', 'field-name-month', 'field-name-year'
        // we want keep them and allow to map it in reqest but also we need combined value like 'field-name'
        // the value was set in enricher while enriching Page
        this.setDateFieldValueInData(context);
        delete context.data[referenceNumberFieldName];

        const requestModel = await this.objectBuilder.create(context.data, apiMapping.request);

        // add urls for files to request
        for (const element of context.allElements) {
          const valueElement = element as ValueElement;
          if (valueElement.type == 'FileUpload') {
            const key = `${context.data[sessionIdKey]}/${decodeURIComponent(context.data[valueElement.name])}`;
            const result = await this.fileService.getPresignedUrlForDownload(key);
            if (result.isSuccesfull) {
              requestModel[valueElement.name + '-url'] = result.value;
            } else {
              throw new Error(result.error);
            }
          }
        }

        logger.info('External API endpoint: ' + JSON.stringify(endpoint));
        logger.debug('External API request: ' + JSON.stringify(requestModel));

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (apiMapping.apiKey) {
          headers[apiKeyHeaderKeyName] = apiMapping.apiKey;
          logger.info(`API key provided for operation: ${pageAction.operation}`);
        } else {
          logger.debug(`No API key provided for operation: ${pageAction.operation}`);
        }

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers,
          body: JSON.stringify(requestModel),
        });

        const responseBody = await response.json();

        logger.debug('External API response: ' + response.status + JSON.stringify(responseBody));

        if (response.status >= 400) {
          logger.error('Error from external service: ' + response.status + ' ' + response.statusText);

          // set error response to context
          context.service.errorResponse = responseBody;

          // set page status
          context.page.valid = false;
          context.page.invalid = true;
        }

        if (response.ok) {
          const apiMappingReferenceNumberFieldName =
            jmespath.search(apiMapping.response, referenceNumberFieldName) || referenceNumberFieldName;
          logger.debug('apiMappingReferenceNumberFieldName: ' + apiMappingReferenceNumberFieldName);

          const referenceNumber = jmespath.search(responseBody, apiMappingReferenceNumberFieldName);
          logger.debug('referenceNumber: ' + referenceNumber);

          shouldSaveSession = false;
          await this.formSessionService.removeSession(form, sessionId);

          context.data = {
            ...(context.data[langKey] ? { [langKey]: context.data[langKey] } : {}),
            [referenceNumberFieldName]: referenceNumber,
          };
        }
      }

      this.enricher.enrichSummaryElements(context.page, context);
      this.enricher.enrichErrorElements(context.page, context, pageAction);

      if (shouldSaveSession) {
        await this.formSessionService.saveSession(form, context.data);
      }

      this.createDataCookie(context, res);

      if (!context.page.valid) {
        logger.debug('posted data not valid, re-rendering document');
        res.send(this.renderControl.renderDocument(context));
      } else {
        const nextPagePath = this.getNextPagePath(pageAction, context);
        const nextPageUrl = `/${form}/${nextPagePath}`;
        logger.debug('post successful, redirecting to: ' + nextPageUrl);
        return res.redirect(nextPageUrl);
      }
    } catch (e) {
      next(e);
    }
  };

  private getNextPagePath(pageAction: Action | undefined, context: Context): string {
    if (pageAction?.redirect) {
      logger.debug(`next page path: ${pageAction.redirect}`);
      return pageAction.redirect;
    }

    if (typeof context.page.nextPage === 'string') {
      logger.debug(`next page path: ${context.page.nextPage}`);
      return context.page.nextPage;
    }

    const conditionalNextPage = context.page.nextPage as ConditionalNextPage;
    if (conditionalNextPage) {
      for (const rule of conditionalNextPage.rules) {
        for (const key of Object.keys(rule.match)) {
          logger.debug(`checking the ${key} key in the context data if it has the same value in the rule`);
          logger.debug(`context data: ${context.data[key]} rule value: ${rule.match[key]}`);
          logger.debug(`result: ${context.data[key] === rule.match[key]}`);

          if (context.data[key] === rule.match[key]) {
            logger.debug(`next page path: ${rule.page}`);
            return rule.page || '';
          }
        }
      }
    }

    return '';
  }

  private customErrorHandler = async (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      logger.error(err);

      if (res.headersSent) {
        return next(err);
      }

      const errorPage = await this.buildProblemWithServicePage(req);
      res.status(500).send(errorPage);
    } catch (e) {
      logger.error(e);
      res.status(500).send('Unexpected internal server error.');
    }
  };

  private setDateFieldValueInData(context: Context) {
    for (const element of context.allElements) {
      const valueElement = element as ValueElement;
      if (valueElement.type == 'DatePickerField' && valueElement.value) {
        context.data[valueElement.name] = valueElement.value;
      }
    }
  }

  private async buildProblemWithServicePage(req: express.Request): Promise<string> {
    const errorPageService = getErrorPageService();
    req.params.page = errorPageService.firstPage;
    const errorPageContext = await this.contextBuilder.build(req, errorPageService, true);
    const errorPage = this.renderControl.renderDocument(errorPageContext);

    return errorPage;
  }

  private createDataCookie(context: Context, res: express.Response) {
    const data = context.getDataForCookie();
    const cookieConfig = context.getDataCookieConfig();
    res.cookie(cookieConfig.name, data, cookieConfig.cookieOptions);
  }
}
