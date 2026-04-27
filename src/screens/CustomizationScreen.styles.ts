import { StyleSheet } from 'react-native';
import { colors, componentStyles, layout, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.pagePaddingX,
    paddingTop: layout.pagePaddingTop,
    paddingBottom: layout.pagePaddingBottom,
  },
  card: {
    ...componentStyles.card,
    marginBottom: spacing.md,
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  previewMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  noseControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  noseBtn: {
    width: 68,
    height: 58,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noseBtnSelected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  noseIconWrap: {
    width: 44,
    height: 44,
    overflow: 'hidden',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noseIcon: {
    width: 44,
    height: 44,
    resizeMode: 'cover',
  },
  sideControls: {
    width: 118,
    gap: spacing.sm,
  },
  sideLabel: {
    ...typography.labelCaps,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  sideField: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    gap: 6,
  },
  mouthFieldLabel: {
    ...typography.labelCaps,
    fontSize: 10,
    textTransform: 'none',
  },
  mouthInput: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
    margin: 0,
    textAlign: 'center',
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  baseTile: {
    width: '48%',
    minWidth: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  baseTileSelected: {
    borderColor: colors.borderStrong,
    borderWidth: 2,
  },
  baseTileInner: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: spacing.xs,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  swatchSelected: {
    borderColor: colors.borderStrong,
    borderWidth: 2,
  },
});

