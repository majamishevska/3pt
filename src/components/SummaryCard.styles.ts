import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../utils/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    shadowColor: '#3D342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  body: { marginBottom: 2 },
  hint: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

