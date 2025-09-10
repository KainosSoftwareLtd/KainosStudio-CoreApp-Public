import FCADSRenderer, { getLocalFcaDsStaticPaths } from 'core-fcads';
import GCDSRenderer, { getLocalGcdsStaticPaths } from 'core-gcds';
import GovUkRenderer, { getLocalGdsStaticPaths } from 'core-govuk';
import NhsUkRenderer, { getLocalNhsUkStaticPaths } from 'core-nhsuk';
import OUDSRenderer, { getLocalOudsStaticPaths } from 'core-ouds';
import WDSRenderer, { getLocalWdsStaticPaths } from 'core-wds';

import { Context } from 'core-runtime/lib/context/index.js';
import { Renderer } from 'core-runtime/lib/rendering/index.js';

export const rendererMap: Record<string, () => Renderer> = {
  gcds: () => new GCDSRenderer(),
  ouds: () => new OUDSRenderer(),
  wds: () => new WDSRenderer(),
  nhsds: () => new NhsUkRenderer(),
  fcads: () => new FCADSRenderer(),
};

export function rendererFunc(context: Context): Renderer {
  const key = String(context.service.designSystem || '');
  const renderer = rendererMap[key];
  return renderer ? renderer() : new GovUkRenderer();
}

export const staticPathFuncs = [
  getLocalGdsStaticPaths,
  getLocalGcdsStaticPaths,
  getLocalOudsStaticPaths,
  getLocalWdsStaticPaths,
  getLocalNhsUkStaticPaths,
  getLocalFcaDsStaticPaths,
];

export function getStaticPaths(): { key: string; value: string }[] {
  const staticPaths: { key: string; value: string }[] = [];
  staticPathFuncs.forEach((fn) => staticPaths.push(...fn()));

  return staticPaths;
}
