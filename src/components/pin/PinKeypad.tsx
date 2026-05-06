import { Pressable, Text, View } from 'react-native';
import { colors, radius } from '../../utils/theme';

type Props = {
  disabled?: boolean;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
};

export function PinKeypad({ disabled = false, onDigit, onBackspace, onClear }: Props) {
  return (
    <View style={{ width: 280, gap: 12 }}>
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['clear', '0', 'del'],
      ].map((row, rIdx) => (
        <View key={rIdx} style={{ flexDirection: 'row', gap: 12 }}>
          {row.map((key) => {
            const isAction = key === 'clear' || key === 'del';
            const label = key === 'clear' ? 'Clear' : key === 'del' ? '⌫' : key;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'del' ? 'Delete' : key === 'clear' ? 'Clear PIN' : `Digit ${key}`}
                onPress={() => {
                  if (disabled) return;
                  if (key === 'del') onBackspace();
                  else if (key === 'clear') onClear();
                  else onDigit(key);
                }}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: 56,
                    borderRadius: radius.lg,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.divider,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.5 : 1,
                  },
                  pressed && !disabled && { opacity: 0.9 },
                  isAction && { backgroundColor: 'rgba(17, 17, 17, 0.04)' },
                ]}
                disabled={disabled}
              >
                <Text
                  style={{
                    fontSize: isAction ? 16 : 20,
                    fontWeight: isAction ? '800' : '900',
                    color: colors.text,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

