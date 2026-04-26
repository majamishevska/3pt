import type { DetectedSource } from './types';

function has(s: string, needle: string): boolean {
  return s.toLowerCase().includes(needle.toLowerCase());
}

export function detectSource(fileName: string, raw: string): DetectedSource {
  const name = fileName.toLowerCase();

  if (name.endsWith('.xml') && has(raw, 'apple') && has(raw, 'health')) return 'appleHealth';
  if (has(raw, 'HKHealthStore') || has(raw, 'HKCategoryTypeIdentifierMenstrualFlow') || has(raw, '<HealthData')) {
    return 'appleHealth';
  }

  // Heuristics for Flo/Clue exports vary; keep adapters resilient and detection forgiving.
  if (has(name, 'clue') || has(raw, 'clue')) return 'clue';
  if (has(name, 'flo') || has(raw, 'flo')) return 'flo';

  // If it looks like JSON/CSV and has menstrual/period terms, we'll attempt clue/flo adapters as fallback.
  if (has(raw, 'period') || has(raw, 'menstru')) return 'clue';

  return 'unknown';
}

