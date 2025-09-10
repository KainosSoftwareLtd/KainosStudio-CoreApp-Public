import { Element } from '../service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';

export class Renderer {
  // array of paths to pull the renderer .nlk files from, at least needs a Page.njk file
  public getNunjucksPaths(): string[] {
    return [];
  }

  // elements can be transformed to better match needs of the renderer
  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    return element;
  }
}
