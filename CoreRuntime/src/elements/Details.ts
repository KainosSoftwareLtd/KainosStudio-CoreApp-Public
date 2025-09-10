import { Element } from '../service/Element.js';

export default class Details implements Element {
  public type: string;
  public summaryText: string;
  public text: string;

  public constructor(summaryText: string, text: string) {
    this.type = 'Details';
    this.summaryText = summaryText;
    this.text = text;
  }
}
