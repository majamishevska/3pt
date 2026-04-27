import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { styles } from './MoodPicker.styles';

export type MoodOption = { id: string; label: string };

/** Legacy: old symptom chip `mood` maps to this id in storage. Shown only if selected. */
const GENERAL_MOOD: MoodOption & { icon: React.ComponentProps<typeof Ionicons>['name'] } = {
  id: 'general',
  label: 'General',
  icon: 'ellipse-outline',
};

/** Placeholder icons — swap for your assets later. */
const STANDARD_MOODS: (MoodOption & { icon: React.ComponentProps<typeof Ionicons>['name'] })[] = [
  { id: 'calm', label: 'Calm', icon: 'leaf-outline' },
  { id: 'happy', label: 'Happy', icon: 'happy-outline' },
  { id: 'low', label: 'Low', icon: 'cloud-outline' },
  { id: 'anxious', label: 'Anxious', icon: 'alert-circle-outline' },
  { id: 'irritable', label: 'Irritable', icon: 'flash-outline' },
  { id: 'energetic', label: 'Energetic', icon: 'sunny-outline' },
];

export const MOOD_OPTIONS: MoodOption[] = [GENERAL_MOOD, ...STANDARD_MOODS].map(({ id, label }) => ({ id, label }));

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
  accentFillStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function MoodPicker({ selectedIds, onChange, accentFillStyle, label = 'Mood (optional)' }: Props) {
  const toggle = (id: string) => {
    const has = selectedIds.includes(id);
    const next = has ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next);
  };

  const moodsToShow = selectedIds.includes('general') ? [GENERAL_MOOD, ...STANDARD_MOODS] : STANDARD_MOODS;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {moodsToShow.map((m) => {
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
              <Ionicons name={m.icon} size={16} color={colors.text} />
              <Text style={styles.chipText}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
