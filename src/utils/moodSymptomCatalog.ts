import type React from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type CategorizedOption = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export type OptionCategory = {
  id: string;
  title: string;
  options: CategorizedOption[];
};

export const SYMPTOM_CATEGORIES: OptionCategory[] = [
  {
    id: 'core',
    title: 'Body',
    options: [
      { id: 'cramps', label: 'Cramps', icon: 'stomach' },
      { id: 'bloating', label: 'Bloating', icon: 'water-outline' },
      { id: 'fatigue', label: 'Low energy', icon: 'sleep' },
      { id: 'nausea', label: 'Nausea', icon: 'emoticon-sick-outline' },
    ],
  },
  {
    id: 'head',
    title: 'Head',
    options: [{ id: 'headache', label: 'Headache', icon: 'head-flash' }],
  },
  {
    id: 'skin',
    title: 'Skin',
    options: [{ id: 'acne', label: 'Breakouts', icon: 'emoticon-neutral-outline' }],
  },
];

export const MOOD_CATEGORIES: OptionCategory[] = [
  {
    id: 'steady',
    title: 'Steady',
    options: [
      { id: 'calm', label: 'Calm', icon: 'leaf' },
      { id: 'happy', label: 'Good', icon: 'emoticon-happy-outline' },
    ],
  },
  {
    id: 'heavy',
    title: 'Heavy',
    options: [
      { id: 'low', label: 'Low', icon: 'weather-cloudy' },
      { id: 'irritable', label: 'Irritable', icon: 'lightning-bolt-outline' },
    ],
  },
  {
    id: 'wired',
    title: 'Wired',
    options: [
      { id: 'anxious', label: 'Anxious', icon: 'alert-circle-outline' },
      { id: 'energetic', label: 'Energetic', icon: 'weather-sunny' },
    ],
  },
];

const symptomLabelById = new Map<string, string>(
  SYMPTOM_CATEGORIES.flatMap((c) => c.options.map((o) => [o.id, o.label] as const)),
);

const moodLabelById = new Map<string, string>(MOOD_CATEGORIES.flatMap((c) => c.options.map((o) => [o.id, o.label] as const)));

export function getSymptomLabel(id: string): string {
  return symptomLabelById.get(id) ?? id;
}

export function getMoodLabel(id: string): string {
  return moodLabelById.get(id) ?? id;
}

