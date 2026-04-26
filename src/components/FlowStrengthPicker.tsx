import { Pressable, Text, View } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

type Props = {
  value: number; // 1..5
  onChange: (next: number) => void;
  label?: string;
};

export function FlowStrengthPicker({ value, onChange, label = 'Flow strength (optional)' }: Props) {
  const v = Math.min(5, Math.max(1, Math.round(value || 3)));
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: palette.black,
          textTransform: 'uppercase',
          letterSpacing: 0.7,
          marginBottom: spacing.xs,
        }}
      >
        {label}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const n = idx + 1;
            const filled = n <= v;
            return (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`Flow strength ${n} of 5`}
                accessibilityState={{ selected: n === v }}
                onPress={() => onChange(n)}
                style={({ pressed }) => [
                  {
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: 'rgba(17, 17, 17, 0.22)',
                    backgroundColor: filled ? palette.black : 'transparent',
                  },
                  pressed && { opacity: 0.88 },
                ]}
              />
            );
          })}
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: palette.black, opacity: 0.8 }}>
          {v}/5
        </Text>
      </View>
    </View>
  );
}

