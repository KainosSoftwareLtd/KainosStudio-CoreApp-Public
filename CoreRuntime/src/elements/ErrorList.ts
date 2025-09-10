import { Element, ValueElement } from '../service/Element.js';

export default class ErrorList implements Element {
  public type: string;
  public title: string;
  public errorItems: ErrorItem[] = [];

  public constructor(title: string) {
    this.type = 'ErrorList';
    this.title = title;
  }
}

export class ErrorItem {
  public element?: ValueElement;
  public text?: string;
  public href?: string;
}
