import { Element } from 'core-runtime/lib/service/Element.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { Renderer } from 'core-runtime/lib/rendering/Renderer.js';
import Transformer from './Transformer.js';

export default class OUDSRenderer extends Renderer {
  getNunjucksPaths(): string[] {
    return ['node_modules/core-ouds/lib', 'node_modules/govuk-frontend/dist'];
  }

  public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
    const transformer = new Transformer(nunjucksEnv);
    return transformer.transform(element);
  }
}

export function getLocalOudsStaticPaths() {
  return [
    { key: '/assets', value: 'node_modules/core-ouds/lib/assets' },
    { key: '/public/ouds', value: 'node_modules/core-ouds/lib/public/ouds' },
  ];
}
