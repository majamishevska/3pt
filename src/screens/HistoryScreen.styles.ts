import { StyleSheet } from 'react-native';
import { palette } from '../utils/palette';
import { spacing } from '../utils/theme';

const cardBorder = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(17, 17, 17, 0.1)',
} as const;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  listFlex: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  emptyList: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTopText: { flex: 1, minWidth: 0 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editHit: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    ...cardBorder,
  },
  rangeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.black,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  duration: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: palette.black,
    lineHeight: 20,
    opacity: 0.72,
  },
  notes: { marginTop: spacing.sm, fontSize: 15, lineHeight: 22, color: palette.black },
  meta: { marginTop: spacing.md, fontSize: 12, color: palette.black, opacity: 0.75, lineHeight: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: palette.black, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, lineHeight: 22, color: palette.black, textAlign: 'center' },
});
