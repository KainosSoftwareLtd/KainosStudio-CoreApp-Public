import { Column, Footer, Heading, Paragraph, Row2 } from '../elements/index.js';
import { OpenApiSpecification, Service } from './Service.js';

import { Page } from './Page.js';
import { randomUUID } from 'crypto';

export function getErrorPageService(): Service {
  return {
    name: 'Sorry, there is a problem with the service',
    hash: 'session_data',
    firstPage: 'problem',
    cookieSecret: randomUUID(),
    apiServiceDefinition: {} as OpenApiSpecification,
    cookieBanner: null,
    footer: {} as Footer,
    pages: [
      {
        id: 'problem',
        elements: [
          new Row2([
            new Column('two-thirds', [
              new Heading('Sorry, there is a problem with the service'),
              new Paragraph('Try again later.'),
            ]),
          ]),
        ],
        nextPage: 'problem',
      },
    ],
    apiMappings: {},
    defaultLang: 'en-GB',
  };
}

export function getNotFoundService(): Service {
  let service = {
    name: 'Form not found',
    hash: 'session_data',
    firstPage: 'not-found',
    cookieSecret: 'mysecret',
    apiServiceDefinition: {} as OpenApiSpecification,
    cookieBanner: null,
    footer: {} as Footer,
    pages: [
      {
        id: 'not-found',
        elements: [
          new Row2([
            new Column('two-thirds', [
              new Heading('Form not found'),
              new Paragraph('If you typed the web address, check it is correct.'),
              new Paragraph('If you pasted the web address, check you copied the entire address.'),
            ]),
          ]),
        ],
        nextPage: 'not-found',
      },
    ],
    apiMappings: {},
    defaultLang: 'en-GB',
  };

  return service;
}

export function getNotFoundPage(): Page {
  return {
    id: 'not-found',
    nextPage: 'not-found',
    elements: [
      new Row2([
        new Column('two-thirds', [
          new Heading('Page not found'),
          new Paragraph('If you typed the web address, check it is correct.'),
          new Paragraph('If you pasted the web address, check you copied the entire address.'),
        ]),
      ]),
    ],
  };
}
