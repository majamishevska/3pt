import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../utils/palette';
import { styles } from './SymptomPicker.styles';

export type SymptomOption = { id: string; label: string };

const DEFAULT_SYMPTOMS: (SymptomOption & { icon: React.ComponentProps<typeof Ionicons>['name'] })[] = [
  { id: 'cramps', label: 'Cramps', icon: 'pulse-outline' },
  { id: 'bloating', label: 'Bloating', icon: 'water-outline' },
  { id: 'mood', label: 'Mood', icon: 'happy-outline' },
  { id: 'headache', label: 'Headache', icon: 'bandage-outline' },
  { id: 'fatigue', label: 'Fatigue', icon: 'moon-outline' },
  { id: 'acne', label: 'Acne', icon: 'sparkles-outline' },
];

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
  accentFillStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function SymptomPicker({ selectedIds, onChange, accentFillStyle, label = 'Symptoms (optional)' }: Props) {
  const toggle = (id: string) => {
    const has = selectedIds.includes(id);
    const next = has ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {DEFAULT_SYMPTOMS.map((s) => {
          const selected = selectedIds.includes(s.id);
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={s.label}
              onPress={() => toggle(s.id)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                selected && accentFillStyle,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Ionicons name={s.icon} size={16} color={palette.black} />
              <Text style={styles.chipText}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

