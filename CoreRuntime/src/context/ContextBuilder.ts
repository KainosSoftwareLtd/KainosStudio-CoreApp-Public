import { buildDataCookieConfig, loadCookieData } from './CookieConfig.js';
import { langKey, sessionIdKey } from '../consts.js';

import { Context } from './index.js';
import { DataRetrievalService } from '../services/DataRetrievalService.js';
import { FormSessionService } from '../store/FormSessionService.js';
import { Service } from '../service/index.js';
import { ValueElement } from '../service/Element.js';
import express from 'express';
import { logger } from '../index.js';

// default profile that we are using in ssoHandler.ts
export interface Profile {
  issuer: string;
  sessionIndex?: string;
  nameID: string;
  nameIDFormat: string;
  nameQualifier?: string;
  spNameQualifier?: string;
  ID?: string;
  mail?: string;
  email?: string;
  ['urn:oid:0.9.2342.19200300.100.1.3']?: string;
  getAssertionXml?(): string;
  getAssertion?(): Record<string, unknown>;
  getSamlResponseXml?(): string;
  [attributeName: string]: unknown;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: Profile;
  }
}

export class ContextBuilder {
  private formSessionService: FormSessionService;
  private dataRetrievalService: DataRetrievalService;

  public constructor(formSessionService: FormSessionService) {
    this.formSessionService = formSessionService;
    this.dataRetrievalService = new DataRetrievalService();
  }

  public async build(
    req: express.Request,
    service: Service,
    shouldBuildWithoutData: boolean = false,
  ): Promise<Context> {
    const dataCookieConfig = buildDataCookieConfig(service, req);

    const cookieData = loadCookieData(req, service, dataCookieConfig);
    const sessionId = cookieData[sessionIdKey];

    let sessionData = null;
    if (!shouldBuildWithoutData && sessionId) {
      const form = req.params.form;
      sessionData = await this.formSessionService.getSession(form, sessionId);
    }

    const data = sessionData ?? cookieData;
    // Use language from cookie, as changes via GET requests are not persisted to the database
    if (sessionData && cookieData[langKey] !== sessionData[langKey]) {
      data[langKey] = cookieData[langKey];
    }

    const context = new Context(req, service, data, dataCookieConfig);

    const externalUrl = context.service.dataRetrievalUrl;
    if (!shouldBuildWithoutData && externalUrl && context.page.allElements) {
      const valueElements = context.page.allElements.filter((element): element is ValueElement => 'name' in element);

      let userId: string | undefined;
      if (req.user) {
        userId = req.user.nameID;
        logger.debug(`Logged user used for enriching data: ${userId}`);
      }

      await this.dataRetrievalService.enrichData(externalUrl, valueElements, data, userId);
    }

    return context;
  }
}
