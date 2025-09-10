import { Footer } from '../elements/index.js';
import { Page } from './index.js';
import { Resource } from 'i18next';

export class Service {
  public name: string = 'myname';
  public designSystem?: 'gds' | 'gcds' | 'ouds' | 'wds' | 'nhsds' | 'fcads' = 'gds';
  public apiServiceDefinition: OpenApiSpecification = {} as OpenApiSpecification;
  public hash?: string;
  public cookieSecret: string = 'mysecret';
  public firstPage: string = 'landing';
  public cookieBanner: CookieBanner | null = null;
  public footer: Footer | null = null;
  public pages: Page[] = [];
  public apiMappings: ApiMappings = {};
  public errorResponse?: string;
  public hasCookiePage?: boolean;
  public defaultLang: string = 'en-GB';
  public selectedLang?: string;
  public i18n?: { default: string; resources: Resource };
  public googleAnalyticsMeasurementId?: string;
  public dataRetrievalUrl?: string
}

export interface OpenApiSpecification {
  servers?: Server[];
  paths: PathsObject;
}

export interface Server {
  url: string;
  variables?: Record<string, ServerVariable>;
  description?: string;
}

interface Operation {
  operationId: string;
  servers?: Server[];
  [key: string]: any;
}

interface MethodObject {
  [method: string]: Operation;
}

interface PathObject {
  servers?: Server[];
  [method: string]: any;
}

interface PathsObject {
  [path: string]: PathObject;
}

interface ServerVariable {
  default: string;
}

export interface BasePath {
  default: string;
}

export interface RequestMappings {
  [index: string]: string;
}

export interface Components {
  schemas: Schema;
}

export interface Schema {}

export interface ApiMappings {
  [key: string]: FormMappings;
}

export interface FormMappings {
  request: RequestMappings;
  response: ResponseMappings;
}

export interface ResponseMappings {
  title: string;
  fieldNames?: string;
  fieldErrorMessages?: string;
  numErrors?: string;
}

export interface CookieBanner {}
