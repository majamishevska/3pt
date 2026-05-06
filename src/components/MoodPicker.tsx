import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { styles } from './MoodPicker.styles';
import { MOOD_CATEGORIES } from '../utils/moodSymptomCatalog';

export type MoodOption = { id: string; label: string };

/** Legacy: old symptom chip `mood` maps to this id in storage. Shown only if selected. */
const GENERAL_MOOD_ID = 'general';
export const MOOD_OPTIONS: MoodOption[] = [{ id: GENERAL_MOOD_ID, label: 'General' }, ...MOOD_CATEGORIES.flatMap((c) => c.options)].map(
  ({ id, label }) => ({ id, label }),
);

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
  accentFillStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function MoodPicker({ selectedIds, onChange, accentFillStyle, label = 'Mood' }: Props) {
  const toggle = (id: string) => {
    const has = selectedIds.includes(id);
    const next = has ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next);
  };

  const options = MOOD_CATEGORIES.flatMap((c) => c.options);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((m) => {
          const selected = selectedIds.includes(m.id);
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={m.label}
              onPress={() => toggle(m.id)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                selected && accentFillStyle,
                pressed && { opacity: 0.9 },
              ]}
            >
              <MaterialCommunityIcons name={m.icon} size={16} color={colors.text} />
              <Text style={styles.chipText}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
