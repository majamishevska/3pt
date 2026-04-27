import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../utils/theme';

export const styles = StyleSheet.create({
  /** Background color comes from `phaseScreenBg[phaseId]` in BottomBar (matches screens). */
  safe: {},
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  pill: {
    flex: 1,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  tabHit: {
    height: 44,
    minWidth: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Plus button: flat, like the black pill. */
  plusOuter: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
});
