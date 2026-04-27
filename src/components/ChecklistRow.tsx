import { Pressable, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';

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
        <Text style={{ ...typography.body, fontWeight: '700' }}>{label}</Text>
        {typeof count === 'number' ? (
          <Text style={{ marginTop: 2, ...typography.helper, fontSize: 13 }}>{count} found</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.accentMuted }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
      />
    </Pressable>
  );
}

