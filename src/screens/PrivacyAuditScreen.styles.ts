import { Platform, StyleSheet } from 'react-native';
import { colors, componentStyles, layout, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: layout.pagePaddingX, paddingTop: layout.pagePaddingTop, paddingBottom: layout.pagePaddingBottom },
  body: { marginTop: 4, ...typography.body, lineHeight: 22 },
  section: {
    marginTop: spacing.lg,
    ...typography.labelCaps,
    marginBottom: spacing.sm,
  },
  card: {
    ...componentStyles.card,
  },
  row: { marginBottom: spacing.md },
  itemTitle: { ...typography.body, fontWeight: '700', lineHeight: 21 },
  desc: { marginTop: 4, ...typography.helper, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  bold: { fontWeight: '700', color: colors.text },
  footer: { marginTop: spacing.lg, ...typography.helper, textAlign: 'center', lineHeight: 18 },

  exportCard: {
    ...componentStyles.card,
  },
  fieldLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    ...typography.labelCaps,
  },
  fieldLabelFirst: {
    marginTop: 0,
    marginBottom: spacing.xs,
    ...typography.labelCaps,
  },
  input: {
    ...componentStyles.input,
  },
  helper: {
    marginTop: spacing.xs,
    ...typography.helper,
    lineHeight: 17,
  },
  error: {
    marginTop: spacing.xs,
    ...typography.helper,
    color: colors.text,
  },
  presetsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  presetChip: {
    flex: 1,
    ...componentStyles.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    ...typography.smallLabel,
    fontSize: 14,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  formatChip: {
    flexGrow: 1,
    flexBasis: 0,
    ...componentStyles.buttonSecondary,
  },
  formatChipSelected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  formatChipLabel: {
    ...typography.smallLabel,
  },
  exportButton: {
    marginTop: spacing.lg,
    ...componentStyles.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exportButtonPressed: { opacity: 0.92 },
  exportLabel: { ...typography.button },

  pathBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(17, 17, 17, 0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pathLabel: {
    ...typography.smallLabel,
    fontSize: 12,
    marginBottom: 4,
  },
  pathText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  copyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  copyPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  copyPillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  lastExportNote: {
    marginTop: spacing.md,
    ...typography.helper,
    fontSize: 14,
    lineHeight: 20,
  },
  technical: {
    marginTop: spacing.xs,
    ...typography.helper,
    lineHeight: 17,
  },
  inlineFieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    ...typography.labelCaps,
  },

  dangerCard: {
    ...componentStyles.card,
  },
  dangerButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.text,
  },
  dangerButtonLabel: { ...typography.button, color: colors.surface, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.38)',
    padding: spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    ...componentStyles.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  modalBody: { marginTop: spacing.sm, ...typography.helper, fontSize: 14, lineHeight: 20 },
  modalActions: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  modalButton: {
    flex: 1,
    ...componentStyles.buttonSecondary,
    backgroundColor: 'rgba(17, 17, 17, 0.06)',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  modalButtonLabel: { ...typography.smallLabel, fontSize: 15, fontWeight: '800' },
  modalButtonLabelPrimary: { ...typography.smallLabel, fontSize: 15, fontWeight: '900', color: colors.surface },
});
