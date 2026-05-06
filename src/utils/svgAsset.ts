import { Asset } from 'expo-asset';

const svgXmlCache = new Map<number, string>();

export async function loadSvgXmlFromModule(mod: number): Promise<string> {
  const cached = svgXmlCache.get(mod);
  if (cached) return cached;
  const asset = Asset.fromModule(mod);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri;
  // In SSR/static export (Node), `uri` can be a relative "/assets/..." URL.
  // Node fetch requires an absolute URL; return empty xml in that scenario.
  if (typeof window === 'undefined' && typeof uri === 'string' && uri.startsWith('/')) {
    svgXmlCache.set(mod, '');
    return '';
  }
  const res = await fetch(uri);
  const xml = await res.text();
  svgXmlCache.set(mod, xml);
  return xml;
}

/**
 * Basic monochrome tinting for SVGs used as icons.
 * - Sets default `fill`/`stroke` on the root `<svg>`
 * - Rewrites explicit black fills/strokes in attributes and inline styles
 */
export function tintSvgMonochrome(svgXml: string, colorHex: string): string {
  const withRootColor = svgXml.replace(
    /<svg\b([^>]*)>/,
    (m, attrs) => `<svg${attrs} fill="${colorHex}" stroke="${colorHex}">`,
  );

  return withRootColor
    .replace(/fill="#000000"/gi, `fill="${colorHex}"`)
    .replace(/fill="#000"/gi, `fill="${colorHex}"`)
    .replace(/stroke="#000000"/gi, `stroke="${colorHex}"`)
    .replace(/stroke="#000"/gi, `stroke="${colorHex}"`)
    .replace(/stroke:\s*#000000/gi, `stroke:${colorHex}`)
    .replace(/stroke:\s*#000/gi, `stroke:${colorHex}`)
    .replace(/fill:\s*#000000/gi, `fill:${colorHex}`)
    .replace(/fill:\s*#000/gi, `fill:${colorHex}`);
}

