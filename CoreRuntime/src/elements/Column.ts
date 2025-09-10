import { Element, ContainerElement } from '../service/Element.js';

export default class Column implements ContainerElement {
  public type: string;
  public elements: Element[];
  public columnWidth: string;

  public fractionWords = [
    'zero',
    'one-twelfth',
    'one-sixth',
    'one-quarter',
    'one-third',
    'five-twelfths',
    'one-half',
    'seven-twelfths',
    'two-thirds',
    'three-quarters',
    'five-sixths',
    'full',
  ];

  public constructor(columnWidth: string, elements: Element[]) {
    this.type = 'Column';
    this.columnWidth = columnWidth;
    this.elements = elements;
  }
}
