import { Element } from 'core-runtime/lib/service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { Renderer } from 'core-runtime/lib/rendering/Renderer.js';
import Transformer from './Transformer.js';

export default class NhsUkRenderer extends Renderer {
  getNunjucksPaths(): string[] {
    return ['node_modules/core-nhsuk/lib', 'node_modules/nhsuk-frontend/packages'];
  }

  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    const transformer = new Transformer(nunjucksEnv);
    return transformer.transform(element);
  }
}

export function getLocalNhsUkStaticPaths() {
  return [
    { key: '/assets/nhsuk', value: 'node_modules/nhsuk-frontend/packages/assets' },
    { key: '/public/nhsuk', value: 'node_modules/core-nhsuk/lib/public/nhsuk' },
  ];
}
