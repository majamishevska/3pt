import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DEFAULT_PHASE_DEFINITIONS, type CyclePhaseId } from '../utils/phaseConfig';
import {
  cycleDayFromAnchor,
  latestPeriodStartBefore,
  mockLastPeriodStartISO,
  resolvePhaseForCycleDay,
} from '../utils/cycleMath';
import { parseISODate, toDateISO } from '../utils/dates';
import { loadEntries } from '../utils/storage';

export function useCyclePhaseId(): CyclePhaseId {
  const [phaseId, setPhaseId] = useState<CyclePhaseId>('menstrual');

  const refresh = useCallback(async () => {
    const todayISO = toDateISO(new Date());
    const entries = await loadEntries();
    const phaseDefs = DEFAULT_PHASE_DEFINITIONS;
    const cycleLength = phaseDefs.reduce((s, p) => s + p.days, 0);
    const savedAnchor = latestPeriodStartBefore(entries, todayISO);
    const anchorISO = savedAnchor ?? mockLastPeriodStartISO(parseISODate(todayISO));
    const cycleDay = cycleDayFromAnchor(anchorISO, todayISO, cycleLength);
    const ctx = resolvePhaseForCycleDay(cycleDay, phaseDefs);
    setPhaseId(ctx.current.phaseId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return phaseId;
}
