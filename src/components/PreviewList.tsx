import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';

type Props = {
  items: string[];
  emptyLabel?: string;
};

export function PreviewList({ items, emptyLabel = 'No preview available.' }: Props) {
  if (!items || items.length === 0) {
    return <Text style={{ marginTop: spacing.xs, ...typography.helper, fontSize: 13 }}>{emptyLabel}</Text>;
  }
  return (
    <View style={{ marginTop: spacing.xs, gap: 6 }}>
      {items.map((it, idx) => (
        <View key={`${idx}-${it}`} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: colors.textTertiary }}>•</Text>
          <Text style={{ flex: 1, ...typography.helper, fontSize: 13, lineHeight: 18, color: colors.textSecondary }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

