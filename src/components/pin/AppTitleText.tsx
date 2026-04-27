import { Text } from 'react-native';
import { colors } from '../../utils/theme';

type Props = {
  text?: string;
};

export function AppTitleText({ text = '3PT' }: Props) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.4,
        color: colors.text,
      }}
    >
      {text}
    </Text>
  );
}

