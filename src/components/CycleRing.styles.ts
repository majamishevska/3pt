import { StyleSheet } from 'react-native';
import { colors, spacing } from '../utils/theme';

export const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  wrapFlush: {
    marginVertical: 0,
  },
  overlayFill: {
    ...StyleSheet.absoluteFillObject,
  },
  centerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dayNum: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  daySub: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

