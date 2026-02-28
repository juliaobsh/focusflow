import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fmtMinutes } from '@/lib/helpers';

interface Props {
  totalMinutes: number;
  maxMinutes: number;
  completedCount: number;
  deferredCount: number;
}

export function CapacityBar({ totalMinutes, maxMinutes, completedCount, deferredCount }: Props) {
  const pct = Math.min(1, totalMinutes / maxMinutes);
  const isOver = pct > 0.9;

  const cardBg = useThemeColor({ light: '#f4f4f8', dark: '#1a1a2e' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0ea', dark: '#2a2a45' }, 'background');
  const trackColor = useThemeColor({ light: '#e8e8f0', dark: '#2a2a45' }, 'background');

  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.row}>
        <ThemedText style={styles.label}>TODAY'S CAPACITY</ThemedText>
        <View style={styles.nums}>
          <ThemedText style={[styles.used, { color: isOver ? '#ef4444' : '#0a7ea4' }]}>
            {fmtMinutes(totalMinutes)}
          </ThemedText>
          <ThemedText style={styles.max}> / {fmtMinutes(maxMinutes)}</ThemedText>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%` as any, backgroundColor: isOver ? '#ef4444' : '#0a7ea4' },
          ]}
        />
      </View>

      {(completedCount > 0 || deferredCount > 0) && (
        <View style={styles.foot}>
          {completedCount > 0 && (
            <ThemedText style={styles.done}>✓ {completedCount} done</ThemedText>
          )}
          {deferredCount > 0 && (
            <ThemedText style={styles.deferred}>{deferredCount} deferred</ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '600', opacity: 0.45, letterSpacing: 1 },
  nums: { flexDirection: 'row', alignItems: 'center' },
  used: { fontSize: 14, fontWeight: '700' },
  max: { fontSize: 14, opacity: 0.45 },
  track: { height: 6, borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  foot: { flexDirection: 'row', gap: 12 },
  done: { fontSize: 12, color: '#6ee7b7' },
  deferred: { fontSize: 12, opacity: 0.4 },
});