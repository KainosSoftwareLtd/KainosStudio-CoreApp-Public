import { Element } from '../service/Element.js';

export default class Footer implements Element {
  public type: string;
  public links: FooterLink[];
  public transformed?: any;

  public constructor(links: FooterLink[]) {
    this.type = 'Footer';
    this.links = links;
  }
}

export class FooterLink {
  public text: string;
  public href: string;
  public attributes: any[] = [];

  public constructor(text: string, href: string) {
    this.text = text;
    this.href = href;
  }
}
