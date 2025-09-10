import { Element } from '../service/Element.js';

export default class InsetText implements Element {
    public type: string;
    public displayText: string;
  
    public constructor(displayText: string) {
      this.type = 'InsetText';
      this.displayText = displayText;
    }
  }