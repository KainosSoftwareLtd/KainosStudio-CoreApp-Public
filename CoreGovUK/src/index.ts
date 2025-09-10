import { Element } from 'core-runtime/lib/service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { Renderer } from 'core-runtime/lib/rendering/Renderer.js';
import Transformer from './Transformer.js';

export default class GovUkRenderer extends Renderer {
  getNunjucksPaths(): string[] {
    return ['node_modules/core-govuk/lib', 'node_modules/govuk-frontend/dist'];
  }

  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    const transformer = new Transformer(nunjucksEnv);
    return transformer.transform(element);
  }
}

export function getLocalGdsStaticPaths() {
  return [
    { key: '/assets', value: 'node_modules/govuk-frontend/dist/govuk/assets' },
    { key: '/public/gds', value: 'node_modules/core-govuk/lib/public/gds' },
  ];
}
