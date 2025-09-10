import { Element } from 'core-runtime/lib/service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { Renderer } from 'core-runtime/lib/rendering/Renderer.js';
import Transformer from './Transformer.js';

export default class FCADSRenderer extends Renderer {
  getNunjucksPaths(): string[] {
    return ['node_modules/core-fcads/lib', 'node_modules/govuk-frontend/dist'];
  }

  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    const transformer = new Transformer(nunjucksEnv);
    return transformer.transform(element);
  }
}

export function getLocalFcaDsStaticPaths() {
  return [
    { key: '/assets/fcads', value: 'node_modules/core-fcads/lib/assets/fcads' },
    { key: '/public/fcads', value: 'node_modules/core-fcads/lib/public/fcads' },
  ];
}
