import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { styles } from './SummaryCard.styles';

type Props = {
  title: string;
  children: ReactNode;
  hint?: string;
};

export function SummaryCard({ title, children, hint }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}
