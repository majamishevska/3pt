import { StyleSheet } from 'react-native';
import { colors, componentStyles, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  wrap: {},
  title: {
    ...typography.labelCaps,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.helper,
    marginBottom: spacing.sm,
  },
  summary: {
    ...typography.smallLabel,
    marginBottom: spacing.sm,
  },
  calendarWrap: {
    ...componentStyles.card,
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  navHit: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerTitle: {
    ...typography.sectionTitle,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.labelCaps,
    textTransform: 'none',
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  week: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dayToday: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  dayMuted: {
    opacity: 0.28,
  },
  dayLabelRange: {
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerButton: {
    flex: 1,
    ...componentStyles.buttonSecondary,
  },
  footerButtonPrimary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  footerLabel: {
    ...typography.smallLabel,
  },
  dirtyNote: {
    marginTop: spacing.xs,
    ...typography.helper,
  },
});
