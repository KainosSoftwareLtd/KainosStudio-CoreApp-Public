import { ContainerElement, Element } from '../service/Element.js';
import { Page, Service } from '../service/index.js';
import { langKey, referenceNumberFieldName, sessionIdKey } from '../consts.js';

import { CookieConfig } from './CookieConfig.js';
import DOMPurify from 'dompurify';
import { FakeCheckboxOption } from '../elements/CheckboxField.js';
import { FooterLink } from '../elements/Footer.js';
import { JSDOM } from 'jsdom';
import { SessionManager } from './SessionManager.js';
import _ from 'lodash';
import express from 'express';
import { getNotFoundPage } from '../service/DefinedKfdServices.js';
import { logger } from '../index.js';

const cookiePageName = 'cookie';
const maxSingleDataLength = 2500;

export class Context {
  public page: Page;
  public data: Record<string, string> = {};
  public service: Service;
  public allElements: Element[] = [];
  private dataCookieConfig: CookieConfig;

  public constructor(
    req: express.Request,
    service: Service,
    data: Record<string, string>,
    dataCookieConfig: CookieConfig,
  ) {
    this.service = _.cloneDeep(service);
    this.data = data;
    this.dataCookieConfig = dataCookieConfig;

    const hasCookiePage = this.hasCookiePage(this.service);
    if (hasCookiePage) {
      this.service.hasCookiePage = hasCookiePage;
      this.addCookieFooter(this.service);
    }

    const pageId = req.params.page;
    const pageWithId = this.getPageById(pageId);
    if (pageWithId) {
      this.page = pageWithId;
    } else {
      logger.info("Couldn't find page named: " + pageId);
      this.page = this.getNotFoundPage();
    }

    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        let value = req.body[key];

        // workaround for checkbox to handle not selected values by user
        if (value === FakeCheckboxOption) {
          value = '';
        }
        if (Array.isArray(value)) {
          if (value[value.length - 1] === FakeCheckboxOption) {
            value.pop();
          }
        }

        const cleanValue = purify.sanitize(value).substring(0, maxSingleDataLength);
        logger.info(`adding data for ${key} : ${cleanValue}`);
        this.data[key] = cleanValue;
      });
    }

    this.service.defaultLang = this.service.i18n?.default || 'en-GB';
    this.service.selectedLang = this.data[langKey];

    this.service.pages.forEach((page) => {
      const flat: Element[] = this.flattenElements(page.elements, page);
      page.allElements = flat;
      this.allElements.push(...flat);
    });
  }

  private getNotFoundPage(): Page {
    const notFoundPage = this.getPageById('not-found');
    if (notFoundPage) {
      return notFoundPage;
    }

    return getNotFoundPage();
  }

  private getPageById(pageId: string): Page | undefined {
    return this.service.pages.find((page: Page) => page.id === pageId);
  }

  public getDataForCookie() {
    const keysInCookie = [sessionIdKey, langKey, referenceNumberFieldName];
    const dataForCookie: Record<string, string> = {};
    for (const key of keysInCookie) {
      const keyValue = this.data[key];
      if (keyValue) {
        dataForCookie[key] = keyValue;
      }
    }
    return new SessionManager().encodeSession(dataForCookie, this.service);
  }

  public getDataCookieConfig() {
    return this.dataCookieConfig;
  }

  public isValid() {
    return true;
  }

  private flattenElements(elements: Element[], page: Page) {
    const flat: Element[] = [];
    if (!elements) return flat;
    elements.forEach((item) => {
      item.page = page;
      flat.push(item);
      if (Array.isArray((item as ContainerElement).elements)) {
        flat.push(...this.flattenElements((item as ContainerElement).elements, page));
      }
    });
    return flat;
  }

  private addCookieFooter(service: Service) {
    const footer = service.footer;
    if (footer) {
      const cookiePageLink = new FooterLink('core:footer.cookie-link-text', cookiePageName);

      if (footer.links) {
        footer.links.push(cookiePageLink);
      } else {
        footer.links = [cookiePageLink];
      }
    }
  }

  private hasCookiePage(service: Service) {
    const hasCookiePage = service.pages.some((p) => p.id === cookiePageName);
    return hasCookiePage;
  }
}
