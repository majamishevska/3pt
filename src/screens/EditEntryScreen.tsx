import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { RangeCalendar } from '../components/RangeCalendar';
import { FlowStrengthPicker } from '../components/FlowStrengthPicker';
import { MoodPicker } from '../components/MoodPicker';
import { SymptomPicker } from '../components/SymptomPicker';
import { getEntryById, updateEntry } from '../utils/storage';
import type { CycleEntry } from '../utils/types';
import { compareISO, toDateISO } from '../utils/dates';
import { useAvatarBackgroundStyle, useProfileAccentColor } from '../hooks/useAvatarBackgroundStyle';
import { colors } from '../utils/theme';
import { styles } from './EditEntryScreen.styles';

export default function EditEntryScreen() {
  const bg = useAvatarBackgroundStyle();
  const { hex: accentHex, accentFill } = useProfileAccentColor();
  const todayISO = useMemo(() => toDateISO(new Date()), []);

  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const [entry, setEntry] = useState<CycleEntry | null>(null);
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [rangeDirty, setRangeDirty] = useState(false);
  const [flowStrength, setFlowStrength] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const baselineRef = useRef<{
    start: string;
    end: string;
    flowStrength: number;
    notes: string;
    symptomsKey: string;
    moodKey: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        if (!id) {
          setEntry(null);
          return;
        }
        const e = await getEntryById(id);
        if (!e) {
          setEntry(null);
          return;
        }
        setEntry(e);
        setStartDate(e.periodStartDate);
        setEndDate(e.periodEndDate);
        setFlowStrength(e.flowStrength ?? 3);
        setSymptoms(e.symptoms ?? []);
        setMood(e.mood ?? []);
        setNotes(e.notes ?? '');
        baselineRef.current = {
          start: e.periodStartDate,
          end: e.periodEndDate,
          flowStrength: e.flowStrength ?? 3,
          notes: (e.notes ?? '').trim(),
          symptomsKey: JSON.stringify((e.symptoms ?? []).slice().sort()),
          moodKey: JSON.stringify((e.mood ?? []).slice().sort()),
        };
      })();
    }, [id]),
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!entry || !baselineRef.current) return false;
    const base = baselineRef.current;
    const currentNotes = notes.trim();
    const currentSymptomsKey = JSON.stringify(symptoms.slice().sort());
    const currentMoodKey = JSON.stringify(mood.slice().sort());
    const datesChanged = compareISO(startDate, base.start) !== 0 || compareISO(endDate, base.end) !== 0;
    const flowChanged = (flowStrength ?? 3) !== (base.flowStrength ?? 3);
    const notesChanged = currentNotes !== base.notes;
    const symptomsChanged = currentSymptomsKey !== base.symptomsKey;
    const moodChanged = currentMoodKey !== base.moodKey;
    return rangeDirty || datesChanged || flowChanged || notesChanged || symptomsChanged || moodChanged;
  }, [entry, endDate, flowStrength, mood, notes, rangeDirty, startDate, symptoms]);

  const confirmLeaveIfDirty = () => {
    if (!hasUnsavedChanges) {
      router.back();
      return;
    }
    Alert.alert('Not saved yet', 'You have changes that haven’t been saved.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const onSave = async () => {
    if (!entry) return;
    const start = compareISO(startDate, endDate) <= 0 ? startDate : endDate;
    const end = compareISO(startDate, endDate) <= 0 ? endDate : startDate;
    setSaving(true);
    try {
      await updateEntry({
        ...entry,
        periodStartDate: start,
        periodEndDate: end,
        flowStrength,
        symptoms,
        mood,
        notes: notes.trim(),
      });
      Alert.alert('Saved', 'Updated on this device.');
      router.back();
    } finally {
      setSaving(false);
    }
  };

  if (!entry) {
    return (
      <SafeAreaView style={[styles.root, bg]} edges={['top']}>
        <ScreenHeader title="Edit entry" showBack />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.subtitle}>We couldn’t find that entry.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="Edit entry" showBack onBackPress={confirmLeaveIfDirty} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <View style={styles.card}>
              <RangeCalendar
                title="Period dates"
                committedStart={startDate}
                committedEnd={endDate}
                onApply={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
                selectionFillStyle={accentFill}
                rangeMiddleStyle={[accentFill, { opacity: 0.38 }]}
                maxISO={todayISO}
                showHint={false}
                onDirtyChange={setRangeDirty}
              />
            </View>
            <View style={styles.card}>
              <FlowStrengthPicker value={flowStrength} onChange={setFlowStrength} accentColor={accentHex} />
            </View>
            <View style={styles.card}>
              <MoodPicker selectedIds={mood} onChange={setMood} accentFillStyle={accentFill} />
            </View>
            <View style={styles.card}>
              <SymptomPicker selectedIds={symptoms} onChange={setSymptoms} accentFillStyle={accentFill} />
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything you want to remember"
                placeholderTextColor="rgba(17, 17, 17, 0.45)"
                style={[styles.input, styles.notes]}
                multiline
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.save,
              accentFill,
              pressed && styles.savePressed,
              (saving || rangeDirty) && styles.saveDisabled,
            ]}
            onPress={onSave}
            disabled={saving || rangeDirty}
          >
            <Ionicons name="checkmark" size={18} color={colors.text} />
            <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

