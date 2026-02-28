import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CapacityBar } from '@/components/capacity-bar';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { SchedulingIntelligence } from '@/components/scheduling-intelligence';
import { TaskCard } from '@/components/task-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDate, generatePlan, getNextTask } from '@/lib/helpers';
import { useStore } from '@/lib/store';

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const {
    tasks, settings,
    completeTask, deferTask, pauseTask, resumeTask, deleteTask,
    loaded,
  } = useStore();

  const maxMinutes = settings.maxHoursPerDay * 60;
  const { scheduled, deferred, waiting, totalMinutes } = generatePlan(tasks, maxMinutes, settings);
  const done = tasks.filter((t) => t.status === 'done');
  const next = getNextTask(scheduled);

  const deferBorderColor = useThemeColor({ light: '#d1d5db', dark: '#2a2a45' }, 'background');
  const waitingBg = useThemeColor({ light: '#fffbeb', dark: '#1e1a0e' }, 'background');
  const waitingBorder = useThemeColor({ light: '#fde68a', dark: '#3d3200' }, 'background');
  const muted = useThemeColor({ light: '#6b7280', dark: '#8888a0' }, 'icon');

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors[colorScheme].tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#a8d5e8', dark: '#0d1f2d' }}
      headerImage={
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>FocusFlow</ThemedText>
          <ThemedText style={styles.headerDate}>{formatDate(new Date())}</ThemedText>
        </View>
      }>

      {/* Capacity bar */}
      <CapacityBar
        totalMinutes={totalMinutes}
        maxMinutes={maxMinutes}
        completedCount={done.length}
        deferredCount={deferred.length}
      />

      {/* Focus CTA */}
      <TouchableOpacity
        style={[
          styles.focusBtn,
          { backgroundColor: Colors[colorScheme].tint },
          !next && styles.focusBtnDisabled,
        ]}
        onPress={() => next && router.push('/focus' as any)}
        activeOpacity={0.8}>
        <ThemedText style={styles.focusBtnText}>⚡  What should I work on now?</ThemedText>
      </TouchableOpacity>

      {/* ── TODAY'S SCHEDULE ── */}
      <ThemedView style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionIcon}>📅</ThemedText>
          <ThemedText type="subtitle">
            Today's Schedule{scheduled.length > 0 ? ` (${scheduled.length} tasks)` : ''}
          </ThemedText>
        </View>

      </ThemedView>

      {scheduled.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>✦</ThemedText>
          <ThemedText type="defaultSemiBold">No tasks yet</ThemedText>
          <ThemedText style={[styles.emptyHint, { color: muted }]}>
            Add a task below to get your day planned
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.list}>
          {scheduled.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDefer={deferTask}
              onPause={pauseTask}
              onDelete={deleteTask}
            />
          ))}
        </ThemedView>
      )}



      {/* ── WAITING TASKS ── */}
      {waiting.length > 0 && (
        <>
          <View style={[styles.waitingSection, { backgroundColor: waitingBg, borderColor: waitingBorder }]}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionIcon}>⏳</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: '#d97706' }}>
                Waiting Tasks ({waiting.length})
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionSubtitle, { color: '#d97706', opacity: 0.8 }]}>
              These tasks are still on today's list, but temporarily paused
            </ThemedText>
            <View style={styles.list}>
              {waiting.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDefer={deferTask}
                  onResume={resumeTask}
                  onDelete={deleteTask}
                  isWaiting
                />
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── DEFERRED TASKS ── dashed border like Figma */}
      {deferred.length > 0 && (
        <View style={[styles.deferredSection, { borderColor: deferBorderColor }]}>
          <View style={styles.sectionTitleRow}>
            <ThemedText style={styles.sectionIcon}>ℹ</ThemedText>
            <ThemedText type="defaultSemiBold">
              Deferred Tasks ({deferred.length})
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionSubtitle, { color: muted }]}>
            These tasks don't fit in today's {settings.maxHoursPerDay}-hour limit. They'll be scheduled tomorrow.
          </ThemedText>
          <View style={styles.list}>
            {deferred.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={completeTask}
                onDefer={deferTask}
                onDelete={deleteTask}
                muted
              />
            ))}
          </View>
        </View>
      )}

      {/* ── COMPLETED ── */}
      {done.length > 0 && (
        <>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">Completed ({done.length})</ThemedText>
          </ThemedView>
          <ThemedView style={styles.list}>
            {done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={completeTask}
                onDefer={deferTask}
                onDelete={deleteTask}
                done
              />
            ))}
          </ThemedView>
        </>
      )}

      {/* ── SCHEDULING INTELLIGENCE ── */}
      <SchedulingIntelligence tasks={tasks} settings={settings} />

    </ParallaxScrollView>

      {/* Floating Add Task button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add' as any)}
        activeOpacity={0.88}>
        <View style={styles.fabInner}>
          <View style={styles.fabPlus} />
          <View style={[styles.fabPlus, styles.fabPlusV]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerContent: {
    position: 'absolute', bottom: 24, left: 20, gap: 4,
  },
  headerTitle: { color: '#fff', fontSize: 32 },
  headerDate: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

  focusBtn: {
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center',
  },
  focusBtnDisabled: { opacity: 0.35 },
  focusBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: { fontSize: 16 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18 },

  list: { gap: 8, backgroundColor: 'transparent' },

  emptyState: {
    alignItems: 'center', paddingVertical: 36, gap: 6, backgroundColor: 'transparent',
  },
  emptyIcon: { fontSize: 26, opacity: 0.25 },
  emptyHint: { fontSize: 13, opacity: 0.4, textAlign: 'center' },



  // Waiting section — amber tinted card
  waitingSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },

  // Deferred section — dashed border like Figma
  deferredSection: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 108 : 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  fabInner: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
  fabPlus: { position: 'absolute', width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  fabPlusV: { transform: [{ rotate: '90deg' }] },
});