import { ValueElement } from '../service/Element.js';

export default class BulletedListField implements ValueElement {
    public type: string;
    public name: string;
    public displayText: string;
    public isPageHeading: boolean;
    public items: BulletedListItem[] = [];

  public constructor(name: string, displayText: string, isPageHeading: boolean, stringOptions: string[]) {
    this.type = 'BulletedList';
    this.name = name;
    this.displayText = displayText;
    this.isPageHeading = isPageHeading;
    stringOptions.forEach((item) => this.items.push({ text: item }));
  }
}

export class BulletedListItem {
    public text?: string;
}
