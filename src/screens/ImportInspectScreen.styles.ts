import { StyleSheet } from 'react-native';
import { colors, componentStyles, layout, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: layout.pagePaddingX,
    paddingTop: layout.pagePaddingTop,
    paddingBottom: layout.pagePaddingBottom,
  },
  intro: { ...typography.helper, fontSize: 14, lineHeight: 20 },
  sectionLabel: { marginTop: spacing.lg, ...typography.labelCaps },
  optionList: { marginTop: spacing.sm, gap: spacing.sm },
  optionCard: {
    ...componentStyles.card,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  optionCardSelected: { borderColor: colors.text },
  optionText: { flex: 1 },
  optionTitle: { ...typography.sectionTitle, fontWeight: '900' },
  optionBody: { marginTop: 4, ...typography.helper, fontSize: 13, lineHeight: 18 },

  fileCardWrap: { marginTop: spacing.sm },

  infoCard: { ...componentStyles.card, marginTop: spacing.sm },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  pillBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(17, 17, 17, 0.06)',
  },
  pillBadgeText: { ...typography.smallLabel, fontSize: 13, fontWeight: '800' },
  infoTitle: { ...typography.smallLabel, fontSize: 15, fontWeight: '900' },
  infoSub: { marginTop: 4, ...typography.helper, fontSize: 13, lineHeight: 18 },
  issuesList: { marginTop: spacing.md, gap: 6 },
  issueRow: { flexDirection: 'row', gap: 8 },
  issueBullet: { color: colors.textTertiary },
  issueText: { flex: 1, ...typography.helper, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: 'rgba(17, 17, 17, 0.08)', marginVertical: spacing.sm },

  primaryButton: { ...componentStyles.buttonPrimary, marginTop: spacing.lg, flexDirection: 'row', gap: 8 },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryLabel: { ...typography.button, fontWeight: '900' },

  darkButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.text,
  },
  darkButtonLabel: { ...typography.button, color: colors.surface, fontWeight: '900' },

  secondaryButton: { ...componentStyles.buttonSecondary, marginTop: spacing.sm, flexDirection: 'row', gap: 8 },
  secondaryLabel: { ...typography.button, fontWeight: '900' },

  errorNote: { marginTop: spacing.lg, ...typography.helper },
});

