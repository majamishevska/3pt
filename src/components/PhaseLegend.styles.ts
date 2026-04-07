import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../utils/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '48%',
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  swatch_menstrual: { backgroundColor: colors.phaseMenstrual },
  swatch_follicular: { backgroundColor: colors.phaseFollicular },
  swatch_ovulation: { backgroundColor: colors.phaseOvulation },
  swatch_luteal: { backgroundColor: colors.phaseLuteal },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
  },
});

