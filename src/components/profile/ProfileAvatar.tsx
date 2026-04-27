import { Image, type ImageStyle, type StyleProp, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useEffect, useMemo, useState } from 'react';
import type { ProfileCustomization } from '../../utils/settingsStorage';
import {
  applyCustomizationFills,
  getMouthPngSource,
  getNosePngSource,
  loadBaseSvgXml,
  normalizeMouthChar,
} from '../../utils/profileCustomization';

type Props = {
  size: number;
  customization: ProfileCustomization;
  style?: StyleProp<ViewStyle>;
};

export function ProfileAvatar({ size, customization, style }: Props) {
  const mouthChar = normalizeMouthChar(customization.mouthChar);
  const [svgXml, setSvgXml] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const xml = await loadBaseSvgXml(customization.base);
      if (!mounted) return;
      setSvgXml(xml);
    })();
    return () => {
      mounted = false;
    };
  }, [customization.base]);

  const baseXml = useMemo(() => {
    if (!svgXml) return null;
    return applyCustomizationFills(svgXml, { bodyFill: customization.colorHex, eyesFill: 'transparent' });
  }, [customization.colorHex, svgXml]);

  const eyesXml = useMemo(() => {
    if (!svgXml) return null;
    return applyCustomizationFills(svgXml, { bodyFill: 'transparent', eyesFill: '#202020' });
  }, [svgXml]);

  const overlayStyle: StyleProp<ImageStyle> = {
    position: 'absolute',
    width: size,
    height: size,
    left: 0,
    top: 0,
    resizeMode: 'contain',
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {baseXml ? <SvgXml xml={baseXml} width={size} height={size} /> : null}

      {/* Eyes should always stay above base */}
      {eyesXml ? <SvgXml xml={eyesXml} width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} /> : null}

      <Image source={getMouthPngSource(mouthChar)} style={overlayStyle} />

      {customization.nose !== 'none' ? <Image source={getNosePngSource(customization.nose)} style={overlayStyle} /> : null}
    </View>
  );
}

