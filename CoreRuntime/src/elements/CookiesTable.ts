import { Element } from '../service/Element.js';

export default class CookiesTable implements Element {
  public type: string;
  public displayText: string;
  public cookies?: CookiesTableItem[][];

  public constructor(displayText: string, cookies: CookiesTableItem[][]) {
    this.type = 'CookiesTable';
    this.displayText = displayText;
    this.cookies = cookies;
  }
}

export class CookiesTableItem {
  public text: string;

  public constructor(text: string) {
    this.text = text;
  }
}