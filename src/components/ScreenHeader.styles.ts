import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(17, 17, 17, 0.12)',
    backgroundColor: 'transparent',
  },
  backHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: palette.black,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17, 17, 17, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  bunnyEmoji: {
    fontSize: 20,
    lineHeight: 22,
  },
  settingsHit: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17, 17, 17, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
