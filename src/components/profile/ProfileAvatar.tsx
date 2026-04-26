import { Image, type ImageStyle, type StyleProp, View, type ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import type { ProfileCustomization } from '../../utils/settingsStorage';
import { getBaseSvgUri, getMouthPngSource, getNosePngSource, normalizeMouthChar } from '../../utils/profileCustomization';

type Props = {
  size: number;
  customization: ProfileCustomization;
  style?: StyleProp<ViewStyle>;
};

export function ProfileAvatar({ size, customization, style }: Props) {
  const mouthChar = normalizeMouthChar(customization.mouthChar);

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
          borderRadius: size / 2,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, backgroundColor: customization.colorHex }} />

      <SvgUri uri={getBaseSvgUri(customization.base)} width={size} height={size} />

      <Image source={getMouthPngSource(mouthChar)} style={overlayStyle} />

      {customization.showNose ? <Image source={getNosePngSource()} style={overlayStyle} /> : null}
    </View>
  );
}

