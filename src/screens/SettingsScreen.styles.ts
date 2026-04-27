import { StyleSheet } from 'react-native';
import { colors, componentStyles, layout, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.pagePaddingX,
    paddingTop: layout.pagePaddingTop,
    paddingBottom: layout.pagePaddingBottom,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    ...typography.labelCaps,
  },
  sectionOptional: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionOptionalTitle: {
    ...typography.labelCaps,
  },
  sectionOptionalHint: {
    ...typography.helper,
  },
  inputRow: {
    paddingVertical: spacing.xs,
  },
  inputRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(17, 17, 17, 0.08)',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  inputHelp: {
    marginTop: 4,
    ...typography.helper,
  },
  rowDisabled: { opacity: 0.45 },
  card: {
    ...componentStyles.card,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'visible',
  },
  avatarLargeImage: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
  },
  bunnyLarge: {
    fontSize: 32,
    lineHeight: 36,
  },
  profileMeta: { flex: 1, gap: 4 },
  profileHint: {
    ...typography.helper,
  },
  rowButtons: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.lg + spacing.xs,
  },
  pillButton: {
    flex: 1,
    minWidth: 0,
    ...componentStyles.pill,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonLabel: {
    ...typography.smallLabel,
  },
  label: {
    ...typography.labelCaps,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  labelFirst: {
    ...typography.labelCaps,
    marginBottom: spacing.xs,
  },
  input: {
    ...componentStyles.input,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchLabelBlock: { flex: 1 },
  switchTitle: {
    ...typography.sectionTitle,
  },
  switchSubtitle: {
    marginTop: 4,
    ...typography.helper,
  },

  emojiModalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emojiModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 17, 17, 0.35)',
  },
  emojiModalCard: {
    ...componentStyles.card,
    padding: spacing.lg,
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  emojiModalHint: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emojiModalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 28,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.lg,
    minHeight: 52,
  },
  emojiModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emojiModalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiModalButtonSecondary: {
    ...componentStyles.buttonSecondary,
  },
  emojiModalButtonPrimary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  emojiModalButtonLabel: {
    ...typography.button,
  },
});
