export type CycleEntry = {
  id: string;
  periodStartDate: string;
  periodEndDate: string;
  /** 1–5 scale (5 = heaviest). */
  flowStrength: number;
  symptoms: string[];
  /** Optional mood tags for this entry (separate from symptoms). */
  mood: string[];
  notes: string;
  savedAt: string;
};
