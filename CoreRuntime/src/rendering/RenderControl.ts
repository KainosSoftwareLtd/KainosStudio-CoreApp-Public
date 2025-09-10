import nunjucks, { Environment as NunjucksEnvironment } from 'nunjucks';

import { Context } from '../context/index.js';
import { Renderer } from './Renderer.js';
import _ from 'lodash';
import { getStaticTranslations } from '../translations/StaticTranslations.js';
import i18next from 'i18next';
import { logger } from '../index.js';

export class RenderControl {
  private nunjucksPaths: string[] = [];
  private rendererFunc: (context: Context) => Renderer;

  constructor(rendererFunc: (context: Context) => Renderer) {
    this.rendererFunc = rendererFunc;
  }

  public renderDocument(context: Context): string {
    const renderer: Renderer = this.rendererFunc(context);
    const nunjucksEnv = this.configureNunjucks(context);

    context.allElements.forEach((element) => {
      element.context = context;
      element.transformed = renderer.transform(element, nunjucksEnv);
    });

    if (context.page.error) {
      renderer.transform(context.page.error, nunjucksEnv);
    }

    if (context.service.footer) {
      context.service.footer.type = 'Footer';
      context.service.footer.transformed = renderer.transform(context.service.footer, nunjucksEnv);
    }

    return nunjucks.render('Page.njk', context);
  }

  private configureNunjucks(context: Context): NunjucksEnvironment {
    const renderer: Renderer = this.rendererFunc(context);
    const paths = renderer.getNunjucksPaths();

    logger.info('Adding nunjucks paths: ' + JSON.stringify(paths));
    this.nunjucksPaths = paths.concat(this.nunjucksPaths);

    const staticTranslations = getStaticTranslations();
    const translations = _.merge(staticTranslations, context.service.i18n?.resources);

    i18next.init({
      initAsync: false,
      lng: context.service.selectedLang,
      fallbackLng: context.service.defaultLang,
      resources: translations,
    });

    const env = nunjucks.configure(this.nunjucksPaths, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    });

    env.addFilter('trans', (textId, params) => i18next.t(textId, { ...params }));

    return env;
  }
}
