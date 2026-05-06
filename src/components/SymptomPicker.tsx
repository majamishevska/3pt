import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { styles } from './SymptomPicker.styles';
import { SYMPTOM_CATEGORIES } from '../utils/moodSymptomCatalog';

export type SymptomOption = { id: string; label: string };

type Props = {
  selectedIds: string[];
  onChange: (next: string[]) => void;
  accentFillStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function SymptomPicker({ selectedIds, onChange, accentFillStyle, label = 'Symptoms' }: Props) {
  const toggle = (id: string) => {
    const has = selectedIds.includes(id);
    const next = has ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next);
  };

  const options = SYMPTOM_CATEGORIES.flatMap((c) => c.options);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((s) => {
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
              <MaterialCommunityIcons name={s.icon} size={16} color={colors.text} />
              <Text style={styles.chipText}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

