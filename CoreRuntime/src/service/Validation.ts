import { Context } from '../context/index.js';

export interface BaseValidation {
  error: string;
  elementName?: string;
}

export interface RegexValidation extends BaseValidation {
  regex: string | RegExp;
}

export interface FunctionValidation extends BaseValidation {
  validator: (value: any, context?: Context) => Promise<boolean>;
}

export type Validation = RegexValidation | FunctionValidation;
