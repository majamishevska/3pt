import { StyleSheet } from 'react-native';
import { colors, componentStyles, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  label: {
    ...typography.labelCaps,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    gap: 6,
    ...componentStyles.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: colors.borderStrong,
  },
  chipText: {
    ...typography.smallLabel,
    fontSize: 14,
  },
});
