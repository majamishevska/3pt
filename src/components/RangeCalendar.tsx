import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { compareISO, parseISODate, toDateISO } from '../utils/dates';
import {
  applyRangeDayTap,
  canApplyRange,
  rangeFingerprint,
  type RangeDraft,
} from '../utils/rangeSelection';
import {
  buildMonthWeeks,
  formatMonthTitle,
  isoFromDay,
  monthCursorFromISO,
  shiftMonth,
  type MonthCursor,
} from '../utils/calendarMonth';
import { styles } from './RangeCalendar.styles';
import { colors } from '../utils/theme';

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatFriendly(iso: string): string {
  try {
    return parseISODate(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

type Props = {
  title?: string;
  committedStart: string;
  committedEnd: string;
  onApply: (start: string, end: string) => void;
  selectionFillStyle: StyleProp<ViewStyle>;
  /** Highlight for days strictly between the two endpoints. */
  rangeMiddleStyle?: StyleProp<ViewStyle>;
  minISO?: string;
  maxISO?: string;
  /** Hide the instructional hint text above the calendar. */
  showHint?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
};

export function RangeCalendar({
  title,
  committedStart,
  committedEnd,
  onApply,
  selectionFillStyle,
  rangeMiddleStyle,
  minISO,
  maxISO,
  onDirtyChange,
}: Props) {
  const middleStyle = rangeMiddleStyle ?? { backgroundColor: 'rgba(17, 17, 17, 0.07)' };

  const [draft, setDraft] = useState<RangeDraft>(() => ({
    start: committedStart,
    end: committedEnd,
  }));

  const [cursor, setCursor] = useState<MonthCursor>(() => monthCursorFromISO(committedStart));

  useEffect(() => {
    setDraft({ start: committedStart, end: committedEnd });
    setCursor(monthCursorFromISO(committedStart));
  }, [committedStart, committedEnd]);

  const draftFp = rangeFingerprint(draft.start, draft.end);
  const committedFp = rangeFingerprint(committedStart, committedEnd);
  const dirty = draftFp !== committedFp;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const weeks = useMemo(() => buildMonthWeeks(cursor.year, cursor.monthIndex), [cursor.year, cursor.monthIndex]);
  const todayISO = useMemo(() => toDateISO(new Date()), []);

  const goPrev = () => setCursor((c) => shiftMonth(c, -1));
  const goNext = () => setCursor((c) => shiftMonth(c, 1));

  const onDayPress = (iso: string) => {
    setCursor(monthCursorFromISO(iso));
    setDraft((prev) => applyRangeDayTap(prev, iso));
  };

  const onClear = () => {
    setDraft({ start: null, end: null });
    setCursor(monthCursorFromISO(toDateISO(new Date())));
  };

  const fixApply = () => {
    if (!canApplyRange(draft.start, draft.end)) return;
    if (draft.end == null) {
      onApply(draft.start!, draft.start!);
      return;
    }
    const lo = compareISO(draft.start!, draft.end) <= 0 ? draft.start! : draft.end;
    const hi = compareISO(draft.start!, draft.end) <= 0 ? draft.end : draft.start!;
    onApply(lo, hi);
  };

  const summaryLine = (() => {
    if (draft.start == null) return 'No dates selected yet';
    if (draft.end == null) {
      return formatFriendly(draft.start);
    }
    const s = draft.start;
    const e = draft.end;
    if (s === e) return formatFriendly(s);
    const lo = compareISO(s, e) <= 0 ? s : e;
    const hi = compareISO(s, e) <= 0 ? e : s;
    return `${formatFriendly(lo)}  →  ${formatFriendly(hi)}`;
  })();

  const applyDisabled = !canApplyRange(draft.start, draft.end);

  const norm = useMemo(() => {
    if (draft.start == null) return null;
    if (draft.end == null) {
      return { lo: draft.start, hi: draft.start, partial: true as const };
    }
    const a = draft.start;
    const b = draft.end;
    const lo = compareISO(a, b) <= 0 ? a : b;
    const hi = compareISO(a, b) <= 0 ? b : a;
    return { lo, hi, partial: false as const };
  }, [draft.start, draft.end]);

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.summary}>{summaryLine}</Text>

      <View style={styles.calendarWrap}>
        <View style={styles.header}>
          <Pressable onPress={goPrev} style={styles.navHit} accessibilityRole="button" accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{formatMonthTitle(cursor)}</Text>
          <Pressable onPress={goNext} style={styles.navHit} accessibilityRole="button" accessibilityLabel="Next month">
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.weekdays}>
          {WEEKDAY_SHORT.map((l, i) => (
            <Text key={`${l}-${i}`} style={styles.weekday}>
              {l}
            </Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.map((day, di) => {
              if (day == null) {
                return <View key={di} style={styles.cell} />;
              }
              const iso = isoFromDay(cursor.year, cursor.monthIndex, day);
              const disabled =
                (minISO != null && compareISO(iso, minISO) < 0) || (maxISO != null && compareISO(iso, maxISO) > 0);

              let inRange = false;
              let isEndpoint = false;
              if (norm) {
                inRange = compareISO(iso, norm.lo) >= 0 && compareISO(iso, norm.hi) <= 0;
                isEndpoint = iso === norm.lo || iso === norm.hi;
                if (norm.partial && !isEndpoint) inRange = false;
              }

              const isToday = compareISO(iso, todayISO) === 0;
              const onlyRangeFill = inRange && !isEndpoint;

              return (
                <View key={di} style={styles.cell}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => onDayPress(iso)}
                    accessibilityRole="button"
                    accessibilityLabel={iso}
                    accessibilityState={{ selected: inRange, disabled }}
                    style={({ pressed }) => [
                      styles.dayOuter,
                      isToday && !inRange && styles.dayToday,
                      onlyRangeFill && middleStyle,
                      isEndpoint && selectionFillStyle,
                      disabled && styles.dayMuted,
                      pressed && !disabled && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={[styles.dayLabel, inRange && styles.dayLabelRange]}>{day}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear date selection"
          onPress={onClear}
          style={({ pressed }) => [styles.footerButton, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.footerLabel}>Clear</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apply date range"
          disabled={applyDisabled}
          onPress={fixApply}
          style={({ pressed }) => [
            styles.footerButton,
            styles.footerButtonPrimary,
            selectionFillStyle,
            (applyDisabled || pressed) && { opacity: applyDisabled ? 0.45 : 0.9 },
          ]}
        >
          <Text style={styles.footerLabel}>Apply</Text>
        </Pressable>
      </View>
      {draft.start != null && dirty ? <Text style={styles.dirtyNote}>Tap Apply to confirm.</Text> : null}
    </View>
  );
}
