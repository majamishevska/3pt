import { StyleSheet } from 'react-native';
import { colors, componentStyles, layout, spacing, typography } from '../utils/theme';
import { CYCLE_RING_OUTER_DISC } from '../utils/cycleRingLayout';

const R = CYCLE_RING_OUTER_DISC / 2;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: layout.pagePaddingX,
    paddingTop: layout.pagePaddingTop,
    paddingBottom: layout.pagePaddingBottom,
  },
  greeting: { ...typography.body, letterSpacing: 0.2 },
  dateLine: { marginTop: 4, ...typography.screenTitleLg },

  /** Square frame; white disc + ring share the same center (concentric outer barrier). */
  ringStack: {
    width: CYCLE_RING_OUTER_DISC,
    height: CYCLE_RING_OUTER_DISC,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    position: 'relative',
  },
  ringWhiteDisc: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CYCLE_RING_OUTER_DISC,
    height: CYCLE_RING_OUTER_DISC,
    borderRadius: R,
    backgroundColor: colors.surface,
    zIndex: 0,
  },
  ringForeground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  section: { marginTop: spacing.sm, gap: layout.sectionGap },
  card: {
    width: '100%',
    ...componentStyles.card,
  },
  cardTitleSpaced: {
    ...typography.labelCaps,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  cardValue: { ...typography.sectionTitle, lineHeight: 22 },
  cardSubtitle: { marginTop: 4, ...typography.helper },
});
