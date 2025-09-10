import { Context } from '../context/index.js';
import { Page } from './Page.js';
import { Validation } from './Validation.js';

export interface Element {
  type: string;
  context?: Context;
  page?: Page;
  transformed?: any;
}

export interface ContainerElement extends Element {
  elements: Element[];
}

export interface ValueElement extends Element {
  name: string;
  displayText: string;
  shortText?: string;
  hint?: string;
  value?: string;
  validation?: Validation;
  valid?: boolean;
  invalid?: boolean;
}

export interface DateValueElement extends ValueElement {
  invalidDay?: boolean;
  invalidMonth?: boolean;
  invalidYear?: boolean;
  missingDay?: boolean;
  missingMonth?: boolean;
  missingYear?: boolean;
  action?: Action;
}

export interface AddressValueElement extends ValueElement {
  invalidLine1?: boolean;
  invalidTown?: boolean;
  invalidPostcode?: boolean;
  missingPostcode?: boolean;
}

export interface FileUploadElement extends ValueElement {
  uploadedFileName?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface FixedOptionValueElement extends Element {
  options: (object | string)[];
  multiplicity?: boolean;
}

export interface Action {
  redirect?: string;
  operation?: string;
  validation?: boolean;
  value: string;
}
