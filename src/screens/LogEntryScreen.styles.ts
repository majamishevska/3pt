import { StyleSheet } from 'react-native';
import { colors, componentStyles, layout, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: layout.pagePaddingX, paddingTop: layout.pagePaddingTop, paddingBottom: layout.pagePaddingBottom },
  subtitle: { marginTop: 4, ...typography.body },
  section: {
    marginTop: spacing.lg,
    gap: layout.sectionGap,
  },
  card: {
    ...componentStyles.card,
  },
  label: {
    ...typography.labelCaps,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    ...componentStyles.input,
  },
  notes: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.sm },
  save: {
    marginTop: spacing.lg,
    ...componentStyles.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  savePressed: { opacity: 0.92 },
  saveDisabled: { opacity: 0.6 },
  saveLabel: { ...typography.button, color: colors.text },
});
