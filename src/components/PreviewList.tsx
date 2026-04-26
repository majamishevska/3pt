import { Text, View } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

type Props = {
  items: string[];
  emptyLabel?: string;
};

export function PreviewList({ items, emptyLabel = 'No preview available.' }: Props) {
  if (!items || items.length === 0) {
    return <Text style={{ marginTop: spacing.xs, fontSize: 13, color: palette.black, opacity: 0.7 }}>{emptyLabel}</Text>;
  }
  return (
    <View style={{ marginTop: spacing.xs, gap: 6 }}>
      {items.map((it, idx) => (
        <View key={`${idx}-${it}`} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: palette.black, opacity: 0.6 }}>•</Text>
          <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: palette.black }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

