import { View } from 'react-native';
import { AnimatedBearLogo, type BearLogoState } from './AnimatedBearLogo';

type Props = {
  bearState?: BearLogoState;
  logoSize?: number;
  typingTick?: number;
};

export function PinScreenHeader({ bearState = 'default', logoSize = 92, typingTick }: Props) {
  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatedBearLogo state={bearState} size={logoSize} typingTick={typingTick} />
      </View>
    </View>
  );
}

