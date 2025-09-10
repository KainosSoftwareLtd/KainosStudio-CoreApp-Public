import { Element } from './Element.js';
import ErrorList from '../elements/ErrorList.js';
import { Validation } from './Validation.js';

export interface Page {
  id: string;
  nextPage: string | ConditionalNextPage | null;
  preRequisiteData?: string[];
  elements: Element[];
  allElements?: Element[];
  validation?: Validation;
  invalidElements?: Element[];

  valid?: boolean;
  invalid?: boolean;
  error?: ErrorList;
}

export interface ConditionalNextPage {
  rules: NextPageRule[]
}

export interface NextPageRule {
  match: NextPageRuleMatch,
  page: string
}

export interface NextPageRuleMatch {
  [field: string]: string
}
