import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { deleteEntry, loadEntries } from '../utils/storage';
import type { CycleEntry } from '../utils/types';
import { palette } from '../utils/palette';
import { phaseAccentHex, phaseScreenBg } from '../utils/phaseChrome.styles';
import { compareISO } from '../utils/dates';
import { formatPeriodLengthLabel, formatPeriodRangeLabel, periodLengthDaysInclusive } from '../utils/historyFormat';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { styles } from './HistoryScreen.styles';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const list = await loadEntries();
    list.sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
    setEntries(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
      <ScreenHeader title="History" />
      <FlatList
        style={styles.listFlex}
        data={entries}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={phaseAccentHex[phaseId]} />
        }
        contentContainerStyle={entries.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={40} color={palette.black} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyBody}>When you save a range, it will show up here.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const days = periodLengthDaysInclusive(item.periodStartDate, item.periodEndDate);
          const saved = new Date(item.savedAt);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardTopText}>
                  <Text style={styles.rangeTitle}>{formatPeriodRangeLabel(item.periodStartDate, item.periodEndDate)}</Text>
                  <Text style={styles.duration}>{formatPeriodLengthLabel(days)}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit entry"
                    onPress={() => router.push(`/edit/${item.id}` as any)}
                    style={({ pressed }) => [styles.editHit, pressed && { opacity: 0.88 }]}
                    hitSlop={8}
                  >
                    <Ionicons name="create-outline" size={18} color={palette.black} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete entry"
                    onPress={() => {
                      Alert.alert('Delete entry?', 'This will remove this entry from your history on this device.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            void (async () => {
                              await deleteEntry(item.id);
                              await refresh();
                            })();
                          },
                        },
                      ]);
                    }}
                    style={({ pressed }) => [styles.editHit, pressed && { opacity: 0.88 }]}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={palette.black} />
                  </Pressable>
                </View>
              </View>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              <Text style={styles.meta}>
                Saved{' '}
                {saved.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
