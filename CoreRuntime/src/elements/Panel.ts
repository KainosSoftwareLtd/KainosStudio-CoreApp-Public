import { Element } from '../service/Element.js';

export default class Panel implements Element {
  public type: string;
  public title: string;
  public text: string;
  public referenceNumber?: string;

  public constructor(title: string, text: string) {
    this.type = 'Panel';
    this.title = title;
    this.text = text;
  }
}
