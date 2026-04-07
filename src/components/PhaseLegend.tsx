import { View, Text } from 'react-native';
import type { PhaseDefinition } from '../utils/phaseConfig';
import { styles } from './PhaseLegend.styles';

type Props = {
  phases: PhaseDefinition[];
};

export function PhaseLegend({ phases }: Props) {
  return (
    <View style={styles.row}>
      {phases.map((p) => (
        <View key={p.id} style={styles.item}>
          <View style={[styles.swatch, styles[`swatch_${p.id}` as const]]} />
          <Text style={styles.label} numberOfLines={1}>
            {p.shortLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}
