import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../utils/theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
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
    ...typography.screenTitle,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarOuter: {
    width: 38,
    height: 38,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    overflow: 'visible',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
  },
  bunnyEmoji: {
    fontSize: 20,
    lineHeight: 22,
  },
  settingsHit: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
