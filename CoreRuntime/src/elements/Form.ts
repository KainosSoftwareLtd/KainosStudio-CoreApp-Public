import { Element, ContainerElement } from '../service/Element.js';

export default class Form implements ContainerElement {
  public type: string;
  public elements: Element[];

  public constructor(elements: Element[]) {
    this.elements = elements;
    this.type = 'Form';
  }
}
