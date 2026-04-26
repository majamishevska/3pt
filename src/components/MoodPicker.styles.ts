import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

const border = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(17, 17, 17, 0.1)',
} as const;

export const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: palette.white,
    ...border,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: 'rgba(17, 17, 17, 0.22)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.black,
  },
});
