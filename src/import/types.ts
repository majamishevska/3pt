import type { CycleEntry } from '../utils/types';

export type DetectedSource = 'flo' | 'clue' | 'appleHealth' | 'unknown';

export type ImportCategoryId = 'periods' | 'symptoms' | 'notes' | 'unknown';

export type ImportCategoryInspection = {
  id: ImportCategoryId;
  label: string;
  count: number;
  preview: string[];
  defaultEnabled: boolean;
};

export type ImportInspection = {
  source: DetectedSource;
  fileName: string;
  categories: ImportCategoryInspection[];
  issues: string[];
  stats: {
    periodsFound: number;
    span?: { startISO: string; endISO: string };
  };
};

export type ImportSelection = Record<ImportCategoryId, boolean>;

export type ImportResult = {
  source: DetectedSource;
  fileName: string;
  entries: CycleEntry[];
  warnings: string[];
  counts: {
    parsed: number;
    imported: number;
    skippedDuplicates: number;
  };
};

