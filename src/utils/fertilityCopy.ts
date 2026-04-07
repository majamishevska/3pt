import type { CyclePhaseId } from './phaseConfig';

export function fertilitySummary(phaseId: CyclePhaseId): string {
  switch (phaseId) {
    case 'menstrual':
      return 'Bleeding days — conception is unlikely. Rest if you can.';
    case 'follicular':
      return 'Hormones are building; fertility is rising toward mid-cycle.';
    case 'ovulation':
      return 'Around ovulation — if avoiding pregnancy, use your usual protection; if trying, this is a key window.';
    case 'luteal':
      return 'After ovulation — likelihood of conception is lower until your next cycle.';
    default:
      return '';
  }
}
