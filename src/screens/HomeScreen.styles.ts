import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { CYCLE_RING_OUTER_DISC } from '../utils/cycleRingLayout';

const R = CYCLE_RING_OUTER_DISC / 2;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 64,
    paddingTop: 10,
  },
  greeting: { fontSize: 15, fontWeight: '500', color: palette.black, letterSpacing: 0.2 },
  dateLine: { marginTop: 4, fontSize: 26, fontWeight: '700', color: palette.black, letterSpacing: -0.4 },

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
    backgroundColor: palette.white,
    zIndex: 0,
  },
  ringForeground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  section: { marginTop: 8, gap: 12 },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: palette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17, 17, 17, 0.1)',
  },
  cardTitleSpaced: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.black,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardValue: { fontSize: 16, fontWeight: '800', color: palette.black, letterSpacing: -0.2, lineHeight: 22 },
  cardSubtitle: { marginTop: 4, fontSize: 12, color: palette.black, lineHeight: 17 },
});
