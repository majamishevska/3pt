import { useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { RangeCalendar } from '../components/RangeCalendar';
import { FlowStrengthPicker } from '../components/FlowStrengthPicker';
import { MoodPicker } from '../components/MoodPicker';
import { SymptomPicker } from '../components/SymptomPicker';
import { addEntry } from '../utils/storage';
import type { CycleEntry } from '../utils/types';
import { phaseAccentFill } from '../utils/phaseChrome.styles';
import { compareISO, toDateISO } from '../utils/dates';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';
import { colors } from '../utils/theme';
import { styles } from './LogEntryScreen.styles';

export default function LogEntryScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const bg = useAvatarBackgroundStyle();
  const phaseFill = phaseAccentFill[phaseId];
  const todayISO = useMemo(() => toDateISO(new Date()), []);
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [rangeDirty, setRangeDirty] = useState(false);
  const [flowStrength, setFlowStrength] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const hasSavedRef = useRef(false);

  const hasUnsavedChanges =
    rangeDirty ||
    notes.trim().length > 0 ||
    symptoms.length > 0 ||
    mood.length > 0 ||
    flowStrength !== 3 ||
    (startDate !== todayISO || endDate !== todayISO);

  const confirmLeaveIfDirty = () => {
    if (!hasUnsavedChanges || hasSavedRef.current) {
      router.back();
      return;
    }
    Alert.alert('Not saved yet', 'You have changes that haven’t been saved.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const onSave = async () => {
    const start = compareISO(startDate, endDate) <= 0 ? startDate : endDate;
    const end = compareISO(startDate, endDate) <= 0 ? endDate : startDate;
    setSaving(true);
    try {
      const entry: CycleEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        periodStartDate: start,
        periodEndDate: end,
        flowStrength,
        symptoms,
        mood,
        notes: notes.trim(),
        savedAt: new Date().toISOString(),
      };
      await addEntry(entry);
      hasSavedRef.current = true;
      setNotes('');
      setSymptoms([]);
      setMood([]);
      Alert.alert('Saved', 'Stored on this device.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="Log entry" showBack onBackPress={confirmLeaveIfDirty} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Log your period dates, mood, symptoms, or notes you want to remember.</Text>

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
              selectionFillStyle={phaseFill}
              rangeMiddleStyle={[phaseFill, { opacity: 0.38 }]}
              maxISO={todayISO}
              showHint={false}
              onDirtyChange={setRangeDirty}
            />
            </View>
            <View style={styles.card}>
              <FlowStrengthPicker value={flowStrength} onChange={setFlowStrength} />
            </View>
            <View style={styles.card}>
              <MoodPicker selectedIds={mood} onChange={setMood} accentFillStyle={phaseFill} />
            </View>
            <View style={styles.card}>
              <SymptomPicker selectedIds={symptoms} onChange={setSymptoms} accentFillStyle={phaseFill} />
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
              phaseFill,
              pressed && styles.savePressed,
              (saving || rangeDirty) && styles.saveDisabled,
            ]}
            onPress={onSave}
            disabled={saving || rangeDirty}
          >
            <Ionicons name="checkmark" size={18} color={colors.text} />
            <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
