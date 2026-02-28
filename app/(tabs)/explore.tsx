import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calcEstimationAccuracy, fmtMinutes, generatePlan } from '@/lib/helpers';
import { useStore } from '@/lib/store';

export default function AnalyticsScreen() {
  const { tasks, settings, completions } = useStore();

  const maxMinutes = settings.maxHoursPerDay * 60;
  const { scheduled, deferred } = generatePlan(tasks, maxMinutes, settings);
  const done = tasks.filter((t) => t.status === 'done');

  // completion rate
  const totalNonDeferred = tasks.filter((t) => t.status !== 'deferred').length;

  // estimation accuracy from completion records
  const recordsWithActual = completions.filter((c) => c.actualMinutes > 0);
  const avgAccuracy = recordsWithActual.length > 0
    ? Math.round(recordsWithActual.reduce((sum, c) => sum + calcEstimationAccuracy(c.estimatedMinutes, c.actualMinutes), 0) / recordsWithActual.length)
    : null;

  const accurate = recordsWithActual.filter((c) => Math.abs(calcEstimationAccuracy(c.estimatedMinutes, c.actualMinutes)) <= 10).length;
  const overestimated = recordsWithActual.filter((c) => calcEstimationAccuracy(c.estimatedMinutes, c.actualMinutes) > 10).length;
  const underestimated = recordsWithActual.filter((c) => calcEstimationAccuracy(c.estimatedMinutes, c.actualMinutes) < -10).length;

  // total time logged
  const totalLogged = completions.reduce((sum, c) => sum + (c.actualMinutes ?? 0), 0);

  // time by category
  const timeByCategory: Record<string, number> = {};
  for (const c of completions) {
    timeByCategory[c.category] = (timeByCategory[c.category] ?? 0) + (c.actualMinutes ?? 0);
  }
  const sortedCats = Object.entries(timeByCategory).sort((a, b) => b[1] - a[1]);
  const maxCatTime = sortedCats[0]?.[1] ?? 1;

  const cardBg = useThemeColor({ light: '#f8f8ff', dark: '#1a1a2e' }, 'background');
  const borderColor = useThemeColor({ light: '#e2e4ea', dark: '#2a2a45' }, 'background');
  const muted = useThemeColor({ light: '#6b7280', dark: '#8888a0' }, 'icon');

  const CAT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Analytics</ThemedText>
      </ThemedView>

      {/* ── Quick stats row ── */}
      <View style={styles.statsRow}>
        <ThemedView style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={[styles.statIcon, { color: '#10b981' }]}>✓</ThemedText>
          <ThemedText type="title" style={styles.statNum}>{done.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: muted }]}>Tasks Completed</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={[styles.statIcon, { color: '#3b82f6' }]}>◎</ThemedText>
          <ThemedText type="title" style={styles.statNum}>{scheduled.length + deferred.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: muted }]}>Tasks Pending</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={[styles.statIcon, { color: '#8b5cf6' }]}>⏱</ThemedText>
          <ThemedText type="title" style={styles.statNum}>{fmtMinutes(totalLogged)}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: muted }]}>Time Logged</ThemedText>
        </ThemedView>
      </View>

      {/* ── Estimation Accuracy ── */}
      {recordsWithActual.length > 0 ? (
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Estimation Accuracy</ThemedText>
            {avgAccuracy !== null && (
              <ThemedText style={[styles.accuracyBadge, { color: Math.abs(avgAccuracy) <= 10 ? '#10b981' : '#f59e0b' }]}>
                {avgAccuracy > 0 ? '+' : ''}{avgAccuracy}%
              </ThemedText>
            )}
          </View>
          {avgAccuracy !== null && Math.abs(avgAccuracy) <= 10 && (
            <ThemedText style={[styles.accuracyMsg, { color: '#10b981' }]}>
              ◎ You're pretty accurate with your estimates!
            </ThemedText>
          )}
          <View style={styles.accuracyCards}>
            <View style={[styles.accCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <ThemedText style={styles.accNum}>{accurate}</ThemedText>
              <ThemedText style={[styles.accLabel, { color: '#10b981' }]}>Accurate (±10%)</ThemedText>
            </View>
            <View style={[styles.accCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
              <ThemedText style={styles.accNum}>{overestimated}</ThemedText>
              <ThemedText style={[styles.accLabel, { color: '#f59e0b' }]}>Overestimated</ThemedText>
            </View>
            <View style={[styles.accCard, { backgroundColor: '#fff1f2', borderColor: '#fecdd3' }]}>
              <ThemedText style={styles.accNum}>{underestimated}</ThemedText>
              <ThemedText style={[styles.accLabel, { color: '#ef4444' }]}>Underestimated</ThemedText>
            </View>
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Estimation Accuracy</ThemedText>
          <ThemedText style={[styles.emptyMsg, { color: muted }]}>
            Complete tasks with actual time logged to see how accurate your estimates are.
          </ThemedText>
        </ThemedView>
      )}

      {/* ── Time by Category ── */}
      {sortedCats.length > 0 && (
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Time by Category</ThemedText>
          <View style={styles.catBars}>
            {sortedCats.map(([cat, mins], i) => {
              const pct = mins / maxCatTime;
              const color = CAT_COLORS[i % CAT_COLORS.length];
              const totalLogged = sortedCats.reduce((s, [, m]) => s + m, 0);
              const pctOfTotal = totalLogged > 0 ? Math.round((mins / totalLogged) * 100) : 0;
              return (
                <View key={cat} style={styles.catBarRow}>
                  <View style={styles.catBarHeader}>
                    <ThemedText style={styles.catBarLabel}>{cat}</ThemedText>
                    <ThemedText style={[styles.catBarValue, { color: muted }]}>
                      {fmtMinutes(mins)} ({pctOfTotal}%)
                    </ThemedText>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
                    <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </ThemedView>
      )}

      {/* ── Recent Completions ── */}
      {completions.length > 0 && (
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Recent Completions</ThemedText>
          <View style={styles.completionsList}>
            {[...completions].reverse().slice(0, 8).map((c, i) => {
              const acc = calcEstimationAccuracy(c.estimatedMinutes, c.actualMinutes);
              const accColor = Math.abs(acc) <= 10 ? '#10b981' : acc > 0 ? '#f59e0b' : '#ef4444';
              return (
                <View key={i} style={[styles.completionRow, { borderColor }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.completionTitle} numberOfLines={1}>{c.title}</ThemedText>
                    <ThemedText style={[styles.completionCat, { color: muted }]}>{c.category}</ThemedText>
                    <ThemedText style={[styles.completionMeta, { color: muted }]}>
                      Est: {fmtMinutes(c.estimatedMinutes)}  ·  Actual: {fmtMinutes(c.actualMinutes)}  ·  {new Date(c.completedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={[styles.accBadge, { backgroundColor: accColor + '18', borderColor: accColor + '40' }]}>
                    <ThemedText style={[styles.accBadgeText, { color: accColor }]}>
                      {acc > 0 ? '+' : ''}{acc}%
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </ThemedView>
      )}

      <Collapsible title="How estimation accuracy works">
        <ThemedText>
          When you complete a task and enter the actual time it took, FocusFlow compares it against your estimate.
        </ThemedText>
        <ThemedText style={{ marginTop: 6 }}>
          <ThemedText type="defaultSemiBold">±10%</ThemedText> is considered accurate. Over time, this helps you make better estimates and plan more realistic days.
        </ThemedText>
      </Collapsible>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },

  // stats row
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1,
  },
  statIcon: { fontSize: 18 },
  statNum: { fontSize: 24, lineHeight: 28 },
  statLabel: { fontSize: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },

  // sections
  section: {
    borderRadius: 16, padding: 16, borderWidth: 1, gap: 12,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17 },
  emptyMsg: { fontSize: 13, lineHeight: 20 },

  // estimation accuracy
  accuracyBadge: { fontSize: 16, fontWeight: '700' },
  accuracyMsg: { fontSize: 13 },
  accuracyCards: { flexDirection: 'row', gap: 8 },
  accCard: {
    flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4,
  },
  accNum: { fontSize: 22, fontWeight: '700' },
  accLabel: { fontSize: 11, textAlign: 'center' },

  // category bars
  catBars: { gap: 14 },
  catBarRow: { gap: 6 },
  catBarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  catBarLabel: { fontSize: 14, fontWeight: '500' },
  catBarValue: { fontSize: 13 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  // completions list
  completionsList: { gap: 0 },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  completionTitle: { fontSize: 14, fontWeight: '500' },
  completionCat: { fontSize: 12, marginTop: 2 },
  completionMeta: { fontSize: 11, marginTop: 3 },
  accBadge: {
    borderRadius: 8, borderWidth: 1,
    paddingVertical: 4, paddingHorizontal: 8,
  },
  accBadgeText: { fontSize: 12, fontWeight: '700' },
});