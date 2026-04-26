import { Pressable, Switch, Text, View } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

type Props = {
  label: string;
  count?: number;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export function ChecklistRow({ label, count, value, onChange, disabled }: Props) {
  const toggle = () => {
    if (disabled) return;
    onChange(!value);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: value }}
      accessibilityLabel={label}
      onPress={toggle}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.sm,
          gap: spacing.sm,
          opacity: disabled ? 0.5 : 1,
        },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: palette.black }}>{label}</Text>
        {typeof count === 'number' ? (
          <Text style={{ marginTop: 2, fontSize: 13, color: palette.black, opacity: 0.75 }}>{count} found</Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </Pressable>
  );
}

