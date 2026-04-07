import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

const border = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(17, 17, 17, 0.1)',
} as const;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  subtitle: { marginTop: 4, fontSize: 15, lineHeight: 21, color: palette.black },
  section: {
    marginTop: spacing.lg,
    gap: 12,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.md,
    ...border,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: palette.white,
    ...border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: palette.black,
  },
  notes: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.sm },
  save: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  savePressed: { opacity: 0.92 },
  saveDisabled: { opacity: 0.6 },
  saveLabel: { color: palette.black, fontSize: 16, fontWeight: '700' },
});
