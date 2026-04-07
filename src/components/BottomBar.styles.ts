import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';

export const styles = StyleSheet.create({
  /** Background color comes from `phaseScreenBg[phaseId]` in BottomBar (matches screens). */
  safe: {},
  wrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
    paddingTop: 10,
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
    borderRadius: 28,
    backgroundColor: palette.black,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: palette.black,
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
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.black,
  },
});
