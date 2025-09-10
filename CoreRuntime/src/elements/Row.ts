import { Element, ContainerElement } from '../service/Element.js';

export default class Row implements ContainerElement {
  public type: string;
  public elements: Element[];
  public columnWidths: number[];

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

  public constructor(columnWidths: number[], elements: Element[]) {
    this.type = 'Row';
    this.columnWidths = columnWidths;
    this.elements = elements;
  }
}
