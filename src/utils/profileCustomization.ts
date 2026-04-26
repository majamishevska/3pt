import type { ImageSourcePropType } from 'react-native';
import { Asset } from 'expo-asset';

export const customizationColors = ['#bedd3c', '#4ca4f0', '#e9b41f', '#fa97ca', '#ea5035'] as const;
export type CustomizationColor = (typeof customizationColors)[number];

export const customizationBases = ['bear', 'cat', 'dog', 'bunny'] as const;
export type CustomizationBase = (typeof customizationBases)[number];

export type ProfileCustomizationDraft = {
  base: CustomizationBase;
  colorHex: CustomizationColor;
  mouthChar: string;
  showNose: boolean;
};

const baseSvgModules: Record<CustomizationBase, number> = {
  bear: require('../../assets/customization/bear-base.svg'),
  cat: require('../../assets/customization/cat-base.svg'),
  dog: require('../../assets/customization/dog-base.svg'),
  bunny: require('../../assets/customization/bunny-base.svg'),
};

const mouthPngModules: Record<string, number> = {
  t: require('../../assets/customization/t-mouth.png'),
};

const defaultMouthChar = 't';

export function normalizeMouthChar(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return t.slice(0, 1).toLowerCase();
}

export function getBaseSvgUri(base: CustomizationBase): string {
  return Asset.fromModule(baseSvgModules[base]).uri;
}

export function getNosePngSource(): ImageSourcePropType {
  return require('../../assets/customization/nose.png');
}

export function getMouthPngSource(mouthChar: string): ImageSourcePropType {
  const normalized = normalizeMouthChar(mouthChar);
  const key = normalized && mouthPngModules[normalized] ? normalized : defaultMouthChar;
  return mouthPngModules[key] as unknown as ImageSourcePropType;
}

