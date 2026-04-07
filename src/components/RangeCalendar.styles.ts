import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

const border = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(17, 17, 17, 0.1)',
} as const;

export const styles = StyleSheet.create({
  wrap: {},
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.black,
    marginBottom: spacing.sm,
    opacity: 0.92,
  },
  summary: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.black,
    marginBottom: spacing.sm,
  },
  calendarWrap: {
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: palette.white,
    ...border,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    ...border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.black,
    letterSpacing: -0.2,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: palette.black,
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
    color: palette.black,
  },
  dayToday: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17, 17, 17, 0.35)',
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
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    ...border,
  },
  footerButtonPrimary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17, 17, 17, 0.12)',
  },
  footerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.black,
  },
  dirtyNote: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
    color: palette.black,
    opacity: 0.85,
  },
});
