import { Platform, StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

const cardBorder = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(17, 17, 17, 0.1)',
} as const;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  body: { marginTop: 4, fontSize: 15, lineHeight: 22, color: palette.black },
  section: {
    marginTop: spacing.lg,
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.md,
    ...cardBorder,
  },
  row: { marginBottom: spacing.md },
  itemTitle: { fontSize: 15, fontWeight: '700', color: palette.black, lineHeight: 21 },
  desc: { marginTop: 4, fontSize: 14, lineHeight: 20, color: palette.black },
  bold: { fontWeight: '700', color: palette.black },
  footer: { marginTop: spacing.lg, fontSize: 13, color: palette.black, textAlign: 'center', lineHeight: 18 },

  exportCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.md,
    ...cardBorder,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  formatChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    ...cardBorder,
  },
  formatChipSelected: {
    borderWidth: 2,
    borderColor: palette.black,
  },
  formatChipLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.black,
  },
  exportButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exportButtonPressed: { opacity: 0.92 },
  exportLabel: { color: palette.black, fontSize: 16, fontWeight: '700' },

  pathBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 17, 17, 0.04)',
    ...cardBorder,
  },
  pathLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.black,
    marginBottom: 4,
  },
  pathText: {
    fontSize: 12,
    lineHeight: 17,
    color: palette.black,
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
    borderRadius: 12,
    backgroundColor: palette.white,
    ...cardBorder,
  },
  copyPillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.black,
  },
  lastExportNote: {
    marginTop: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: palette.black,
  },
  technical: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 17,
    color: palette.black,
    opacity: 0.85,
  },
  inlineFieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
});
