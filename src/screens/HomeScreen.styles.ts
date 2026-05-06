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

  summaryGrid: { marginTop: spacing.sm, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  summaryRowFlow: { paddingBottom: spacing.xs },
  summaryKey: { ...typography.smallLabel, fontWeight: '900', width: 120 },
  summaryValue: { ...typography.helper, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  flowDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flowDots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flowDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(17, 17, 17, 0.22)',
    overflow: 'hidden',
  },
  flowDotFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.text,
    // keep partial fills visually circular (round left side)
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
  },
  flowDotFillFull: {
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
  },
  flowLabel: { ...typography.helper, color: colors.textSecondary, fontWeight: '800' },
});
