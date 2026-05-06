import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { deleteEntry, loadEntries } from '../utils/storage';
import type { CycleEntry } from '../utils/types';
import { phaseAccentHex } from '../utils/phaseChrome.styles';
import { addDaysISO, compareISO, toDateISO } from '../utils/dates';
import { formatPeriodLengthLabel, formatPeriodRangeLabel, periodLengthDaysInclusive } from '../utils/historyFormat';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';
import { styles } from './HistoryScreen.styles';
import { router } from 'expo-router';
import { buildMonthWeeks, formatMonthTitle, isoFromDay, shiftMonth, type MonthCursor } from '../utils/calendarMonth';
import { loadSettings, type AppSettings } from '../utils/settingsStorage';
import { predictedDateSet, predictPeriodsWithinRange } from '../utils/predictions';
import { colors, componentStyles, radius, spacing, typography } from '../utils/theme';
import { getMoodLabel, getSymptomLabel } from '../utils/moodSymptomCatalog';

type TopMode = 'logs' | 'predictions';
type ViewMode = 'month' | 'year' | 'list';

function yearTitle(y: number): string {
  return String(y);
}

function monthCursorNow(): MonthCursor {
  const d = new Date();
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

function monthStartISO(c: MonthCursor): string {
  return toDateISO(new Date(c.year, c.monthIndex, 1));
}

function monthEndISO(c: MonthCursor): string {
  return toDateISO(new Date(c.year, c.monthIndex + 1, 0));
}

function yearStartISO(y: number): string {
  return `${y}-01-01`;
}

function yearEndISO(y: number): string {
  return `${y}-12-31`;
}

function iterLoggedDates(entries: CycleEntry[]): Set<string> {
  const out = new Set<string>();
  for (const e of entries) {
    const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
    const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
    let cur = lo;
    out.add(cur);
    let guard = 0;
    while (compareISO(cur, hi) < 0 && guard < 31) {
      cur = addDaysISO(cur, 1);
      out.add(cur);
      guard++;
    }
  }
  return out;
}

function entryContainsDateISO(e: CycleEntry, iso: string): boolean {
  const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
  const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
  return compareISO(iso, lo) >= 0 && compareISO(iso, hi) <= 0;
}

function entryForDateISO(entries: CycleEntry[], iso: string): CycleEntry | null {
  // If multiple entries overlap (should be rare), pick the one with the latest start.
  const matches = entries.filter((e) => entryContainsDateISO(e, iso));
  if (matches.length === 0) return null;
  matches.sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
  return matches[0] ?? null;
}

export default function HistoryScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const bg = useAvatarBackgroundStyle();
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [topMode, setTopMode] = useState<TopMode>('logs');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [monthCursor, setMonthCursor] = useState<MonthCursor>(() => monthCursorNow());
  const [yearCursor, setYearCursor] = useState<number>(() => new Date().getFullYear());
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CycleEntry | null>(null);

  const refresh = useCallback(async () => {
    const list = await loadEntries();
    // Keep logs consistent (newest first).
    list.sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
    setEntries(list);
    if (!settings) {
      const s = await loadSettings();
      setSettings(s);
    }
  }, [settings]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const loggedDates = useMemo(() => iterLoggedDates(entries), [entries]);

  const predictedRanges = useMemo(() => {
    if (!settings) return [];
    // Always compute for whichever view is on screen.
    if (viewMode === 'month') {
      return predictPeriodsWithinRange({
        entries,
        settings,
        rangeStartISO: monthStartISO(monthCursor),
        rangeEndISO: monthEndISO(monthCursor),
      });
    }
    if (viewMode === 'year') {
      return predictPeriodsWithinRange({
        entries,
        settings,
        rangeStartISO: yearStartISO(yearCursor),
        rangeEndISO: yearEndISO(yearCursor),
      });
    }
    // List: show upcoming from today → + 365 days
    const today = toDateISO(new Date());
    return predictPeriodsWithinRange({
      entries,
      settings,
      rangeStartISO: today,
      rangeEndISO: addDaysISO(today, 365),
    });
  }, [entries, monthCursor, settings, viewMode, yearCursor]);

  const predictedDates = useMemo(() => predictedDateSet(predictedRanges), [predictedRanges]);

  const header = (
    <View style={styles.header}>
      <View style={styles.viewRow}>
        {(['month', 'year', 'list'] as const).map((v) => {
          const selected = viewMode === v;
          return (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={v === 'list' ? 'List view' : v === 'month' ? 'Month view' : 'Year view'}
              onPress={() => setViewMode(v)}
              style={({ pressed }) => [styles.toggle, selected && styles.toggleSelected, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.toggleText}>{v === 'month' ? 'Month' : v === 'year' ? 'Year' : 'List'}</Text>
            </Pressable>
          );
        })}
      </View>

      {viewMode === 'list' ? (
        <>
          <View style={styles.modeRow}>
            {(['logs', 'predictions'] as const).map((m) => {
              const selected = topMode === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={m === 'logs' ? 'Logs' : 'Predictions'}
                  onPress={() => setTopMode(m)}
                  style={({ pressed }) => [styles.toggle, selected && styles.toggleSelected, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.toggleText}>{m === 'logs' ? 'Logs' : 'Predictions'}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.summary}>{entries.length} entries stored on this device</Text>
        </>
      ) : null}

      {viewMode !== 'list' ? (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendSwatchSolid} />
            <Text style={styles.legendText}>Logged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendSwatchDashed} />
            <Text style={styles.legendText}>Predicted</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  const monthNav = (
    <View style={styles.navRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        onPress={() => setMonthCursor((c) => shiftMonth(c, -1))}
        style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.navTitle}>{formatMonthTitle(monthCursor)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next month"
        onPress={() => setMonthCursor((c) => shiftMonth(c, 1))}
        style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </Pressable>
    </View>
  );

  const yearNav = (
    <View style={styles.navRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous year"
        onPress={() => setYearCursor((y) => y - 1)}
        style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.navTitle}>{yearTitle(yearCursor)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next year"
        onPress={() => setYearCursor((y) => y + 1)}
        style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="History" />
      {viewMode === 'list' ? (
        topMode === 'logs' ? (
          <FlatList
            style={styles.listFlex}
            data={entries}
            keyExtractor={(i) => i.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={phaseAccentHex[phaseId]} />
            }
            contentContainerStyle={entries.length === 0 ? styles.emptyList : styles.list}
            ListHeaderComponent={header}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="leaf-outline" size={40} color={colors.text} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No entries yet</Text>
                <Text style={styles.emptyBody}>When you save a range, it will show up here.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const days = periodLengthDaysInclusive(item.periodStartDate, item.periodEndDate);
              const saved = new Date(item.savedAt);
              const flow = Math.min(5, Math.max(1, Math.round(item.flowStrength ?? 3)));
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View entry"
                  onPress={() => router.push(`/edit/${item.id}` as any)}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardTopText}>
                      <Text style={styles.rangeTitle}>{formatPeriodRangeLabel(item.periodStartDate, item.periodEndDate)}</Text>
                      <Text style={styles.duration}>{formatPeriodLengthLabel(days)}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit entry"
                        onPress={(e) => {
                          (e as any)?.stopPropagation?.();
                          router.push(`/edit/${item.id}` as any);
                        }}
                        style={({ pressed }) => [styles.editHit, pressed && { opacity: 0.88 }]}
                        hitSlop={8}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.text} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete entry"
                        onPress={(e) => {
                          (e as any)?.stopPropagation?.();
                          Alert.alert('Delete entry?', 'This will remove this entry from your history on this device.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                void (async () => {
                                  await deleteEntry(item.id);
                                  await refresh();
                                })();
                              },
                            },
                          ]);
                        }}
                        style={({ pressed }) => [styles.editHit, pressed && { opacity: 0.88 }]}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.flowRow}>
                    <Text style={styles.flowLabel}>Flow</Text>
                    <View style={styles.flowDots} accessibilityLabel={`Flow strength ${flow} of 5`}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.flowDot,
                            { backgroundColor: idx + 1 <= flow ? colors.text : 'transparent' },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.flowLabel}>{flow}/5</Text>
                  </View>
                  {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                  <Text style={styles.meta}>
                    Saved{' '}
                    {saved.toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </Pressable>
              );
            }}
          />
        ) : (
          <FlatList
            style={styles.listFlex}
            data={predictedRanges}
            keyExtractor={(i) => `${i.startISO}-${i.endISO}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={phaseAccentHex[phaseId]} />
            }
            contentContainerStyle={predictedRanges.length === 0 ? styles.emptyList : styles.list}
            ListHeaderComponent={header}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="sparkles-outline" size={40} color={colors.text} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No predictions yet</Text>
                <Text style={styles.emptyBody}>Add at least one logged period to generate predictions.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.rangeTitle}>{formatPeriodRangeLabel(item.startISO, item.endISO)}</Text>
                <Text style={styles.duration}>{formatPeriodLengthLabel(periodLengthDaysInclusive(item.startISO, item.endISO))}</Text>
                <Text style={styles.meta}>Predicted</Text>
              </View>
            )}
          />
        )
      ) : viewMode === 'month' ? (
        <ScrollView
          style={styles.listFlex}
          contentContainerStyle={[styles.list, selectedEntry ? { paddingBottom: 220 } : null]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={phaseAccentHex[phaseId]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {header}
          {monthNav}

          <View style={styles.calWeekdays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <Text key={`${d}-${idx}`} style={styles.calWDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calGrid}>
            {buildMonthWeeks(monthCursor.year, monthCursor.monthIndex).map((week, idx) => (
              <View key={idx} style={styles.calWeek}>
                {week.map((day, cIdx) => {
                  if (!day) return <View key={cIdx} style={[styles.calCell, { opacity: 0 }]} />;
                  const iso = isoFromDay(monthCursor.year, monthCursor.monthIndex, day);
                  const isLogged = loggedDates.has(iso);
                  const isPred = predictedDates.has(iso) && !isLogged;
                  const isSelected = selectedISO === iso;
                  return (
                    <Pressable
                      key={cIdx}
                      accessibilityRole="button"
                      accessibilityLabel={`Day ${day}`}
                      onPress={() => {
                        if (!isLogged) {
                          setSelectedISO(null);
                          setSelectedEntry(null);
                          return;
                        }
                        const e = entryForDateISO(entries, iso);
                        setSelectedISO(iso);
                        setSelectedEntry(e);
                      }}
                      style={({ pressed }) => [
                        styles.calCell,
                        isLogged && styles.calMarkedSolid,
                        isPred && styles.calMarkedPredicted,
                        isSelected && { transform: [{ scale: 0.98 }] },
                        pressed && { opacity: 0.92 },
                      ]}
                    >
                      <Text style={[styles.calDayText, isLogged && styles.calMarkedSolidText]}>{day}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.listFlex}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={phaseAccentHex[phaseId]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {header}
          {yearNav}

          <View style={styles.yearGrid}>
            {Array.from({ length: 12 }).map((_, mIdx) => {
              const title = new Date(yearCursor, mIdx, 1).toLocaleDateString(undefined, { month: 'short' });
              const weeks = buildMonthWeeks(yearCursor, mIdx);
              return (
                <Pressable
                  key={mIdx}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${title} ${yearCursor}`}
                  onPress={() => {
                    setSelectedISO(null);
                    setSelectedEntry(null);
                    setMonthCursor({ year: yearCursor, monthIndex: mIdx });
                    setViewMode('month');
                  }}
                  style={({ pressed }) => [styles.miniMonth, pressed && { opacity: 0.92 }]}
                >
                  <Text style={styles.miniTitle}>{title}</Text>
                  <View style={styles.miniWeekdays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                      <Text key={`${d}-${idx}`} style={styles.miniWDay}>
                        {d}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.miniGrid}>
                    {weeks.map((week, wIdx) => (
                      <View key={wIdx} style={styles.miniWeek}>
                        {week.map((day, dIdx) => {
                          if (!day) return <View key={dIdx} style={[styles.miniCell, { opacity: 0 }]} />;
                          const iso = isoFromDay(yearCursor, mIdx, day);
                          const isLogged = loggedDates.has(iso);
                          const isPred = predictedDates.has(iso) && !isLogged;
                          return (
                            <View
                              key={dIdx}
                              style={[
                                styles.miniCell,
                                isLogged && styles.miniSolid,
                                isPred && styles.miniPredicted,
                              ]}
                            >
                              <Text style={[styles.miniDayText, isLogged && styles.miniSolidText]}>{day}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {viewMode === 'month' && selectedEntry && selectedISO ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: spacing.md,
          }}
        >
          <View
            style={{
              ...componentStyles.card,
              borderRadius: radius.lg,
              padding: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ ...typography.smallLabel, fontWeight: '900' }}>
                  {new Date(selectedISO).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={{ marginTop: 4, ...typography.helper }}>
                  Flow {Math.min(5, Math.max(1, Math.round(selectedEntry.flowStrength ?? 3)))}/5
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit entry"
                onPress={() => router.push(`/edit/${selectedEntry.id}` as any)}
                style={({ pressed }) => [
                  {
                    ...componentStyles.pill,
                    borderColor: colors.text,
                    borderWidth: 2,
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={{ ...typography.smallLabel, fontWeight: '900' }}>Edit</Text>
              </Pressable>
            </View>

            {selectedEntry.symptoms?.length ? (
              <Text style={{ marginTop: spacing.sm, ...typography.helper, color: colors.textSecondary }}>
                Symptoms: {selectedEntry.symptoms.map(getSymptomLabel).join(', ')}
              </Text>
            ) : null}
            {selectedEntry.mood?.length ? (
              <Text style={{ marginTop: spacing.sm, ...typography.helper, color: colors.textSecondary }}>
                Mood: {selectedEntry.mood.map(getMoodLabel).join(', ')}
              </Text>
            ) : null}
            {selectedEntry.notes ? (
              <Text style={{ marginTop: spacing.sm, ...typography.helper, color: colors.textSecondary }}>
                Notes: {selectedEntry.notes}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close details"
              onPress={() => {
                setSelectedISO(null);
                setSelectedEntry(null);
              }}
              style={({ pressed }) => [{ marginTop: 12, alignSelf: 'flex-start' }, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ ...typography.labelCaps, textTransform: 'none' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
