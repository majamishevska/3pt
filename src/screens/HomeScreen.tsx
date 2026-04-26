import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { CycleRing } from '../components/CycleRing';
import { DEFAULT_PHASE_DEFINITIONS } from '../utils/phaseConfig';
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
import { phaseScreenBg } from '../utils/phaseChrome.styles';

import { styles } from './HomeScreen.styles';

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
  const phaseId = ctx.current.phaseId;

  const lastPeriodLine = useMemo(() => {
    if (latestEntry) {
      return `${formatMedium(latestEntry.periodStartDate)} – ${formatMedium(latestEntry.periodEndDate)}`;
    }
    return '—';
  }, [latestEntry]);

  const greetingName = settings?.displayName?.trim();
  const greeting = greetingName ? `Hi ${greetingName}!` : 'Hi there!';

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
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
            <Text style={styles.cardSubtitle}>Day {ctx.cycleDay} of cycle</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitleSpaced}>Next Period</Text>
            <Text style={styles.cardValue}>{formatMedium(nextPeriodISO)}</Text>
            <Text style={styles.cardSubtitle}>Estimated</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitleSpaced}>Last Period</Text>
            <Text style={styles.cardValue}>{lastPeriodLine}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
