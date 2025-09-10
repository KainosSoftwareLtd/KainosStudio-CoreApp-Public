import { Element } from 'core-runtime/lib/service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { Renderer } from 'core-runtime/lib/rendering/Renderer.js';
import Transformer from './Transformer.js';

export default class GCDSRenderer extends Renderer {
  getNunjucksPaths(): string[] {
    return ['node_modules/core-gcds/lib', 'node_modules/govuk-frontend/dist'];
  }

  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    const transformer = new Transformer(nunjucksEnv);
    return transformer.transform(element);
  }
}

export function getLocalGcdsStaticPaths() {
  return [
    { key: '/assets', value: 'node_modules/govuk-frontend/dist/govuk/assets' },
    { key: '/public/gcds', value: 'node_modules/core-gcds/lib/public/gcds' },
  ];
}
