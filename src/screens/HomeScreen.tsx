import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { CycleRing } from '../components/CycleRing';
import { DEFAULT_PHASE_DEFINITIONS, type CyclePhaseId } from '../utils/phaseConfig';
import {
  cycleDayFromAnchor,
  latestPeriodStartBefore,
  mockLastPeriodStartISO,
  nextPeriodStartISO,
  resolvePhaseForCycleDay,
} from '../utils/cycleMath';
import { compareISO, parseISODate, toDateISO } from '../utils/dates';
import { useAppSettings } from '../hooks/useAppSettings';
import { loadEntries } from '../utils/storage';
import type { CycleEntry } from '../utils/types';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';
import { getMoodLabel, getSymptomLabel } from '../utils/moodSymptomCatalog';

import { styles } from './HomeScreen.styles';

function phaseMeaningSentence(phaseId: CyclePhaseId, pregnancyInsightsOn: boolean): string {
  switch (phaseId) {
    case 'menstrual':
      return 'Your uterine lining is shedding — rest and recovery may feel easier right now.';
    case 'follicular':
      return pregnancyInsightsOn
        ? 'Estrogen is rising as a new egg matures, and energy often builds.'
        : 'Estrogen is rising and energy often builds — a good time for momentum.';
    case 'ovulation':
      return pregnancyInsightsOn
        ? 'This is your most fertile window — hormones peak as an egg is released.'
        : 'Hormones peak and your body shifts into the second half of the cycle.';
    case 'luteal':
      return 'Progesterone is higher after ovulation, and PMS‑like symptoms can be more noticeable.';
  }
}

function formatWeekdayMonthDay(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatMedium(iso: string): string {
  try {
    return parseISODate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function pickLatestEntry(entries: CycleEntry[]): CycleEntry | null {
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate))[0];
}

export default function HomeScreen() {
  const { settings } = useAppSettings();
  const bg = useAvatarBackgroundStyle();
  const [todayISO, setTodayISO] = useState(() => toDateISO(new Date()));
  const [entries, setEntries] = useState<CycleEntry[]>([]);

  const refresh = useCallback(async () => {
    setTodayISO(toDateISO(new Date()));
    setEntries(await loadEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const phaseDefs = DEFAULT_PHASE_DEFINITIONS;
  const cycleLength = useMemo(() => phaseDefs.reduce((s, p) => s + p.days, 0), [phaseDefs]);

  const latestEntry = useMemo(() => pickLatestEntry(entries), [entries]);
  const savedAnchor = useMemo(() => latestPeriodStartBefore(entries, todayISO), [entries, todayISO]);
  const anchorISO = savedAnchor ?? mockLastPeriodStartISO(parseISODate(todayISO));

  const cycleDay = cycleDayFromAnchor(anchorISO, todayISO, cycleLength);
  const ctx = resolvePhaseForCycleDay(cycleDay, phaseDefs);
  const nextPeriodISO = nextPeriodStartISO(anchorISO, cycleLength);

  const lastPeriodLine = useMemo(() => {
    if (latestEntry) {
      return `${formatMedium(latestEntry.periodStartDate)} – ${formatMedium(latestEntry.periodEndDate)}`;
    }
    return '—';
  }, [latestEntry]);

  const recentSummary = useMemo(() => {
    if (!entries.length) return null;

    // Look at the last 6 logged periods (newest first).
    const sorted = [...entries].sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
    const window = sorted.slice(0, 6);
    const span = window.length;

    const symptomCounts = new Map<string, number>();
    const moodCounts = new Map<string, number>();
    let flowSum = 0;

    for (const e of window) {
      flowSum += Math.min(5, Math.max(1, Math.round(e.flowStrength ?? 3)));
      for (const id of e.symptoms ?? []) {
        symptomCounts.set(id, (symptomCounts.get(id) ?? 0) + 1);
      }
      for (const id of e.mood ?? []) {
        moodCounts.set(id, (moodCounts.get(id) ?? 0) + 1);
      }
    }

    const top3 = (m: Map<string, number>) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 3);

    const topSymptoms = top3(symptomCounts);
    const topMoods = top3(moodCounts);
    const avgFlowRaw = flowSum / span;
    const avgFlowRounded = Math.round(avgFlowRaw * 10) / 10;

    if (!topSymptoms.length && !topMoods.length) return null;
    return {
      span,
      topSymptoms,
      topMoods,
      avgFlowRaw,
      avgFlowRounded,
    };
  }, [entries]);

  const greetingName = settings?.displayName?.trim();
  const greeting = greetingName ? `Hi ${greetingName}!` : 'Hi there!';

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="Today" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.dateLine}>{"It's " + formatWeekdayMonthDay(parseISODate(todayISO)) + "."}</Text>

        <View style={styles.ringStack}>
          <View style={styles.ringWhiteDisc} />
          <View style={styles.ringForeground}>
            <CycleRing cycleDay={ctx.cycleDay} phases={phaseDefs} omitOuterMargin />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitleSpaced}>Current Phase</Text>
            <Text style={styles.cardValue}>{ctx.current.label}</Text>
            <Text style={styles.cardSubtitle}>
              {phaseMeaningSentence(ctx.current.phaseId, settings?.showPregnancyInfo ?? false)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitleSpaced}>Start of Next Period</Text>
            <Text style={styles.cardValue}>{formatMedium(nextPeriodISO)}</Text>
            <Text style={styles.cardSubtitle}>Estimated from last log + cycle length.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitleSpaced}>Last Period</Text>
            <Text style={styles.cardValue}>{lastPeriodLine}</Text>
          </View>

          {recentSummary ? (
            <View style={styles.card}>
              <Text style={styles.cardTitleSpaced}>Overview</Text>
              <Text style={styles.cardSubtitle}>Based on your last {recentSummary.span} periods.</Text>
              <View style={styles.summaryGrid}>
                {recentSummary.topSymptoms.length ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Top symptoms</Text>
                    <Text style={styles.summaryValue}>
                      {recentSummary.topSymptoms.map(([id, c]) => `${getSymptomLabel(id)} (${c})`).join(', ')}
                    </Text>
                  </View>
                ) : null}

                {recentSummary.topMoods.length ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Top moods</Text>
                    <Text style={styles.summaryValue}>
                      {recentSummary.topMoods.map(([id, c]) => `${getMoodLabel(id)} (${c})`).join(', ')}
                    </Text>
                  </View>
                ) : null}

                <View style={[styles.summaryRow, styles.summaryRowFlow]}>
                  <Text style={styles.summaryKey}>Average flow</Text>
                  <View style={styles.flowDotsRow}>
                    <View style={styles.flowDots}>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const n = idx + 1;
                        const frac = Math.max(0, Math.min(1, (recentSummary.avgFlowRaw ?? 0) - (n - 1)));
                        return (
                          <View
                            key={n}
                            style={styles.flowDot}
                          >
                            {frac > 0 ? (
                              <View
                                style={[
                                  styles.flowDotFill,
                                  { width: `${Math.round(frac * 100)}%` },
                                  frac >= 1 ? styles.flowDotFillFull : null,
                                ]}
                              />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.flowLabel}>{recentSummary.avgFlowRounded}/5</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
