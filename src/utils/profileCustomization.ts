import type { ImageSourcePropType } from 'react-native';
import { Asset } from 'expo-asset';

export const customizationColors = ['#bedd3c', '#4ca4f0', '#e9b41f', '#fa97ca', '#ea5035'] as const;
export type CustomizationColor = (typeof customizationColors)[number];

export const customizationBases = ['bear', 'cat', 'dog', 'bunny'] as const;
export type CustomizationBase = (typeof customizationBases)[number];

export const customizationNoses = ['none', 'circle', 'triangle'] as const;
export type CustomizationNose = (typeof customizationNoses)[number];

export type ProfileCustomizationDraft = {
  base: CustomizationBase;
  colorHex: CustomizationColor;
  mouthChar: string;
  nose: CustomizationNose;
};

const baseSvgModules: Record<CustomizationBase, number> = {
  bear: require('../../assets/customization/bear-base.svg'),
  cat: require('../../assets/customization/cat-base.svg'),
  dog: require('../../assets/customization/dog-base.svg'),
  bunny: require('../../assets/customization/bunny-base.svg'),
};

const mouthPngModules: Record<string, number> = {
  '(': require('../../assets/customization/mouth/(-mouth.png'),
  ')': require('../../assets/customization/mouth/)-mouth.png'),
  '+': require('../../assets/customization/mouth/+-mouth.png'),
  '[': require('../../assets/customization/mouth/[-mouth.png'),
  ']': require('../../assets/customization/mouth/]-mouth.png'),
  '0': require('../../assets/customization/mouth/0-mouth.png'),
  '1': require('../../assets/customization/mouth/1-mouth.png'),
  '2': require('../../assets/customization/mouth/2-mouth.png'),
  '3': require('../../assets/customization/mouth/3-mouth.png'),
  '4': require('../../assets/customization/mouth/4-mouth.png'),
  '5': require('../../assets/customization/mouth/5-mouth.png'),
  '6': require('../../assets/customization/mouth/6-mouth.png'),
  '7': require('../../assets/customization/mouth/7-mouth.png'),
  '8': require('../../assets/customization/mouth/8-mouth.png'),
  a: require('../../assets/customization/mouth/a-mouth.png'),
  b: require('../../assets/customization/mouth/b-mouth.png'),
  d: require('../../assets/customization/mouth/d-mouth.png'),
  e: require('../../assets/customization/mouth/e-mouth.png'),
  f: require('../../assets/customization/mouth/f-mouth.png'),
  g: require('../../assets/customization/mouth/g-mouth.png'),
  h: require('../../assets/customization/mouth/h-mouth.png'),
  i: require('../../assets/customization/mouth/i-mouth.png'),
  j: require('../../assets/customization/mouth/j-mouth.png'),
  k: require('../../assets/customization/mouth/k-mouth.png'),
  m: require('../../assets/customization/mouth/m-mouth.png'),
  n: require('../../assets/customization/mouth/n-mouth.png'),
  o: require('../../assets/customization/mouth/o-mouth.png'),
  p: require('../../assets/customization/mouth/p-mouth.png'),
  q: require('../../assets/customization/mouth/q-mouth.png'),
  r: require('../../assets/customization/mouth/r-mouth.png'),
  s: require('../../assets/customization/mouth/s-mouth.png'),
  t: require('../../assets/customization/mouth/t-mouth.png'),
  u: require('../../assets/customization/mouth/u-mouth.png'),
  w: require('../../assets/customization/mouth/w-mouth.png'),
  x: require('../../assets/customization/mouth/x-mouth.png'),
  y: require('../../assets/customization/mouth/y-mouth.png'),
  z: require('../../assets/customization/mouth/z-mouth.png'),
};

const defaultMouthChar = 'p';

export function normalizeMouthChar(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  const ch = t.slice(0, 1);
  return /[a-z]/i.test(ch) ? ch.toLowerCase() : ch;
}

export function getBaseSvgUri(base: CustomizationBase): string {
  return Asset.fromModule(baseSvgModules[base]).uri;
}

const baseXmlCache = new Map<CustomizationBase, string>();

export async function loadBaseSvgXml(base: CustomizationBase): Promise<string> {
  const cached = baseXmlCache.get(base);
  if (cached) return cached;

  const asset = Asset.fromModule(baseSvgModules[base]);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri;
  const res = await fetch(uri);
  const xml = await res.text();
  baseXmlCache.set(base, xml);
  return xml;
}

function stripInlineStyleTag(svgXml: string): string {
  // `react-native-svg` doesn't consistently apply CSS classes in `<style>` for SvgXml.
  // We'll inject `fill` attributes directly and remove the style tag to avoid conflicts.
  return svgXml.replace(/<style>[\s\S]*?<\/style>/g, '');
}

export function applyCustomizationFills(
  svgXml: string,
  fills: {
    bodyFill: string;
    eyesFill: string;
  },
): string {
  const cleaned = stripInlineStyleTag(svgXml);

  const withBody = cleaned
    // Add/inject fill for body shapes
    .replace(/(<[^>]+\s)(class="cls-1")/g, `$1fill="${fills.bodyFill}" $2`)
    .replace(/(<[^>]+\s)(class='cls-1')/g, `$1fill="${fills.bodyFill}" $2`);

  const withEyes = withBody
    // Add/inject fill for eyes
    .replace(/(<[^>]+\s)(class="cls-2")/g, `$1fill="${fills.eyesFill}" $2`)
    .replace(/(<[^>]+\s)(class='cls-2')/g, `$1fill="${fills.eyesFill}" $2`);

  return withEyes;
}

const nosePngModules: Record<Exclude<CustomizationNose, 'none'>, number> = {
  circle: require('../../assets/customization/nose/circle-nose.png'),
  triangle: require('../../assets/customization/nose/triangle-nose.png'),
};

export function getNosePngSource(nose: Exclude<CustomizationNose, 'none'>): ImageSourcePropType {
  return nosePngModules[nose] as unknown as ImageSourcePropType;
}

export function getMouthPngSource(mouthChar: string): ImageSourcePropType {
  const normalized = normalizeMouthChar(mouthChar);
  const key = normalized && mouthPngModules[normalized] ? normalized : defaultMouthChar;
  return mouthPngModules[key] as unknown as ImageSourcePropType;
}

