import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calcScoreBreakdown } from '@/lib/helpers';
import { Task, UserSettings } from '@/lib/types';

interface Props {
  tasks: Task[];
  settings: UserSettings;
}

export function SchedulingIntelligence({ tasks, settings }: Props) {
  const [open, setOpen] = useState(false);

  const cardBg = useThemeColor({ light: '#f5f3ff', dark: '#16122a' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd6fe', dark: '#2a2045' }, 'background');
  const rowBg = useThemeColor({ light: '#fff', dark: '#1a1a2e' }, 'background');
  const muted = useThemeColor({ light: '#6b7280', dark: '#8888a0' }, 'icon');

  const active = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const scored = active.map((t) => ({
    task: t,
    breakdown: calcScoreBreakdown(t, settings),
  })).sort((a, b) => b.breakdown.total - a.breakdown.total);

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerIcon}>⚙</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            Scheduling Intelligence
          </ThemedText>
        </View>
        <ThemedText style={[styles.chevron, { color: muted }]}>
          {open ? '▲' : '▼'}
        </ThemedText>
      </TouchableOpacity>

      {open && (
        <>
          <ThemedText style={[styles.subtitle, { color: '#7c3aed' }]}>
            See how the scoring system prioritizes your tasks:
          </ThemedText>

          {scored.length === 0 ? (
            <ThemedText style={[styles.empty, { color: muted }]}>
              No active tasks to score.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {scored.map(({ task, breakdown }, i) => (
                <View key={task.id} style={[styles.scoreCard, { backgroundColor: rowBg, borderColor }]}>
                  <View style={styles.scoreHeader}>
                    <ThemedText style={[styles.rank, { color: muted }]}>#{i + 1}</ThemedText>
                    <ThemedText style={styles.taskName} numberOfLines={1}>
                      {task.title}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.totalScore}>
                    Score: {breakdown.total.toFixed(1)}
                  </ThemedText>
                  <View style={styles.breakdown}>
                    <View style={styles.breakdownCol}>
                      <ThemedText style={[styles.bdRow, { color: muted }]}>
                        Base Urgency:
                        <ThemedText style={styles.bdVal}> {breakdown.baseUrgency.toFixed(1)}</ThemedText>
                      </ThemedText>
                      <ThemedText style={[styles.bdRow, { color: muted }]}>
                        Freshness:
                        <ThemedText style={[styles.bdVal, { color: breakdown.freshness > 0 ? '#10b981' : muted }]}>
                          {breakdown.freshness > 0 ? ` +${breakdown.freshness}` : ' 0'}
                        </ThemedText>
                      </ThemedText>
                    </View>
                    <View style={styles.breakdownCol}>
                      <ThemedText style={[styles.bdRow, { color: muted }]}>
                        Category (×{breakdown.categoryMultiplier}):
                        <ThemedText style={[styles.bdVal, { color: breakdown.categoryMultiplier > 0 ? '#10b981' : '#ef4444' }]}>
                          {breakdown.categoryMultiplier > 0 ? ` ×${breakdown.categoryMultiplier}` : ' ×0'}
                        </ThemedText>
                      </ThemedText>
                      <ThemedText style={[styles.bdRow, { color: muted }]}>
                        Friction:
                        <ThemedText style={[styles.bdVal, { color: '#ef4444' }]}>
                          {` ${breakdown.friction}`}
                        </ThemedText>
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: { fontSize: 16, color: '#7c3aed' },
  headerTitle: { fontSize: 15, color: '#7c3aed' },
  chevron: { fontSize: 11 },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  empty: { fontSize: 13, padding: 14, paddingTop: 0 },
  list: { gap: 8, paddingHorizontal: 12, paddingBottom: 14 },
  scoreCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rank: { fontSize: 13, fontWeight: '700', minWidth: 24 },
  taskName: { fontSize: 14, fontWeight: '500', flex: 1 },
  totalScore: { fontSize: 20, fontWeight: '700', color: '#7c3aed' },
  breakdown: { flexDirection: 'row', gap: 12, marginTop: 4 },
  breakdownCol: { flex: 1, gap: 2 },
  bdRow: { fontSize: 12 },
  bdVal: { fontWeight: '600' },
});