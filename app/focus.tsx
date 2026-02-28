import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PausePanel } from '@/components/pause-modal';
import { ThemedText } from '@/components/themed-text';
import { PriorityColors, PriorityLabels } from '@/constants/theme';
import { fmtMinutes, generatePlan, getNextTask, getTaskReason } from '@/lib/helpers';
import { useStore } from '@/lib/store';

// Same dark background as original
const BG    = '#0d1420';
const GOLD  = '#e2c08d';
const WHITE = '#e8e8f0';
const MUTED = 'rgba(255,255,255,0.45)';
const GREEN = '#10b981';
const BLUE  = '#3b82f6';
const AMBER = '#f59e0b';

const EXTRA_OPTS = [10, 15, 30, 45, 60];

function fmt(secs: number) {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Phase = 'idle' | 'focus' | 'break' | 'overtime';

interface Pomo {
  phase: Phase;
  blockIdx: number;
  totalBlocks: number;
  secsLeft: number;
  totalSecs: number;
}

function initPomo(mins: number, focusDur: number): Pomo {
  const blocks    = Math.ceil(mins / focusDur);
  const firstSecs = Math.min(focusDur, mins) * 60;
  return { phase: 'idle', blockIdx: 0, totalBlocks: blocks, secsLeft: firstSecs, totalSecs: firstSecs };
}

export default function FocusScreen() {
  const router = useRouter();
  const { tasks, settings, completeTask, deferTask, pauseTask } = useStore();

  const maxMinutes = settings.maxHoursPerDay * 60;
  const focusDur   = settings.focusDuration || 45;
  const breakDur   = settings.breakDuration || 10;

  const { scheduled } = generatePlan(tasks, maxMinutes, settings);
  const task = getNextTask(scheduled);

  const [pomo, setPomo]       = useState<Pomo | null>(task ? initPomo(task.estimatedMinutes, focusDur) : null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const [showDone, setShowDone]   = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [showEarly, setShowEarly] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (task) {
      setPomo(initPomo(task.estimatedMinutes, focusDur));
      setElapsed(0);
      setRunning(false);
    }
  }, [task?.id]);

  useEffect(() => {
    if (!running || !pomo) return;
    tickRef.current = setInterval(() => {
      if (pomo.phase === 'focus' || pomo.phase === 'overtime') setElapsed(e => e + 1);
      setPomo(prev => {
        if (!prev) return prev;
        const next = prev.secsLeft - 1;
        if (next > 0) return { ...prev, secsLeft: next };

        Vibration.vibrate([0, 300, 100, 300]);

        if (prev.phase === 'focus') {
          const doneBlocks = prev.blockIdx + 1;
          if (doneBlocks >= prev.totalBlocks) {
            setRunning(false);
            setShowDone(true);
            return { ...prev, secsLeft: 0 };
          }
          return { ...prev, phase: 'break', secsLeft: breakDur * 60, totalSecs: breakDur * 60 };
        }
        if (prev.phase === 'break') {
          const nextIdx   = prev.blockIdx + 1;
          const remaining = task!.estimatedMinutes - nextIdx * focusDur;
          const mins      = Math.min(focusDur, remaining);
          return { ...prev, phase: 'focus', blockIdx: nextIdx, secsLeft: mins * 60, totalSecs: mins * 60 };
        }
        if (prev.phase === 'overtime') {
          setRunning(false);
          setShowDone(true);
          return { ...prev, secsLeft: 0 };
        }
        return prev;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running]);

  const elapsedMins = Math.round(elapsed / 60);
  const finish = (mins: number) => { if (task) completeTask(task.id, mins); router.back(); };
  const addTime = (extra: number) => {
    setShowDone(false); setShowExtra(false);
    setPomo(p => p ? { ...p, phase: 'overtime', secsLeft: extra * 60, totalSecs: extra * 60 } : p);
    setRunning(true);
  };
  const pauseAndExit = (reason: string) => {
    if (task) { setRunning(false); pauseTask(task.id, reason); }
    setShowPause(false);
    router.back();
  };

  // ── Empty state (original) ────────────────────────────────────────────────
  if (!task) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <ThemedText style={styles.closeTxt}>✕</ThemedText>
        </TouchableOpacity>
        <View style={styles.allDone}>
          <ThemedText style={{ fontSize: 48 }}>🎊</ThemedText>
          <ThemedText type="title" style={styles.lightText}>All done!</ThemedText>
          <ThemedText style={[styles.lightText, { opacity: 0.5, fontSize: 15 }]}>
            Nothing left on today's plan.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const priorityColor = PriorityColors[task.priority];
  const isIdle  = !pomo || pomo.phase === 'idle';
  const isBreak = pomo?.phase === 'break';
  const isOT    = pomo?.phase === 'overtime';
  const progress = pomo ? 1 - pomo.secsLeft / pomo.totalSecs : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]}>

      {/* Close — original position */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ThemedText style={styles.closeTxt}>✕</ThemedText>
      </TouchableOpacity>

      {/* Pause task button — top-left, only when timer is active */}
      {!isIdle && (
        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={() => { setRunning(false); setShowPause(true); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ThemedText style={styles.closeTxt}>⏸ Pause task</ThemedText>
        </TouchableOpacity>
      )}

      {/* ── Main content — original layout ── */}
      <View style={styles.content}>

        {/* Eyebrow — phase-aware, same gold colour as original */}
        <ThemedText style={[
          styles.eyebrow,
          isBreak && { color: 'rgba(16,185,129,0.85)' },
          isOT    && { color: 'rgba(245,158,11,0.85)'  },
        ]}>
          {isBreak ? 'BREAK TIME' : isOT ? 'OVERTIME' : 'FOCUS ON THIS NOW'}
        </ThemedText>

        {/* Task title — original */}
        <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>

        {/* Meta pills — original */}
        <View style={styles.pills}>
          <View style={styles.pill}>
            <ThemedText style={styles.pillTxt}>⏱ {fmtMinutes(task.estimatedMinutes)}</ThemedText>
          </View>
          <View style={[styles.pill, { borderColor: priorityColor + '70' }]}>
            <ThemedText style={[styles.pillTxt, { color: priorityColor }]}>
              {PriorityLabels[task.priority]}
            </ThemedText>
          </View>
          <View style={styles.pill}>
            <ThemedText style={styles.pillTxt}>{task.category}</ThemedText>
          </View>
        </View>

        {/* Reason — only before timer starts (original) */}
        {isIdle && (
          <ThemedText style={styles.reason}>{getTaskReason(task)}</ThemedText>
        )}

        {/* Timer block — replaces reason once timer is running */}
        {!isIdle && pomo && (
          <View style={styles.timerBlock}>
            {pomo.totalBlocks > 1 && (
              <ThemedText style={styles.blockLabel}>
                {isBreak
                  ? `☕  Break · block ${pomo.blockIdx + 2} of ${pomo.totalBlocks} next`
                  : `Block ${pomo.blockIdx + 1} of ${pomo.totalBlocks}`}
              </ThemedText>
            )}

            <ThemedText style={[
              styles.timerNum,
              isBreak && { color: GREEN },
              isOT    && { color: AMBER },
            ]}>
              {fmt(pomo.secsLeft)}
            </ThemedText>

            <View style={styles.track}>
              <View style={[
                styles.fill,
                {
                  width: `${progress * 100}%` as any,
                  backgroundColor: isBreak ? GREEN : isOT ? AMBER : BLUE,
                },
              ]} />
            </View>

            {pomo.totalBlocks > 1 && (
              <View style={styles.dots}>
                {Array.from({ length: pomo.totalBlocks }).map((_, i) => (
                  <View key={i} style={[
                    styles.dot,
                    i < pomo.blockIdx                  && styles.dotDone,
                    i === pomo.blockIdx && !isBreak    && styles.dotActive,
                  ]} />
                ))}
              </View>
            )}

            {elapsedMins > 0 && (
              <ThemedText style={styles.elapsed}>{fmtMinutes(elapsedMins)} focused so far</ThemedText>
            )}
          </View>
        )}
      </View>

      {/* ── Actions — original gold button shape ── */}
      <View style={styles.actions}>

        {isIdle ? (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => { setPomo(p => p ? { ...p, phase: 'focus' } : p); setRunning(true); }}
            activeOpacity={0.85}>
            <ThemedText style={styles.doneBtnTxt}>▶  Start Timer</ThemedText>
          </TouchableOpacity>
        ) : running ? (
          <TouchableOpacity
            style={[styles.doneBtn, styles.doneBtnPaused]}
            onPress={() => setRunning(false)}
            activeOpacity={0.85}>
            <ThemedText style={[styles.doneBtnTxt, { color: WHITE }]}>⏸  Pause Timer</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => setRunning(true)}
            activeOpacity={0.85}>
            <ThemedText style={styles.doneBtnTxt}>▶  Resume</ThemedText>
          </TouchableOpacity>
        )}

        {!isIdle && !isBreak && (
          <TouchableOpacity
            style={[styles.deferBtn, { borderColor: GREEN + '50', backgroundColor: 'rgba(16,185,129,0.07)' }]}
            onPress={() => { setRunning(false); setShowEarly(true); }}
            activeOpacity={0.7}>
            <ThemedText style={[styles.deferBtnTxt, { color: GREEN }]}>✓  I finished early</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.deferBtn}
          onPress={() => { deferTask(task.id); router.back(); }}
          activeOpacity={0.7}>
          <ThemedText style={styles.deferBtnTxt}>→  Defer to Tomorrow</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Pause reason slide-up */}
      {showPause && (
        <View style={styles.sheet}>
          <ThemedText style={styles.sheetTitle}>Why are you pausing?</ThemedText>
          <PausePanel
            taskTitle={task.title}
            onPause={reason => pauseAndExit(reason)}
            onCancel={() => { setShowPause(false); if (!isIdle) setRunning(true); }}
          />
        </View>
      )}

      {/* "Did you finish?" */}
      <Modal transparent animationType="fade" visible={showDone}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ThemedText style={styles.cardEmoji}>⏰</ThemedText>
            <ThemedText style={styles.cardTitle}>Time's up!</ThemedText>
            <ThemedText style={styles.cardSub}>Did you finish "{task.title}"?</ThemedText>
            <TouchableOpacity style={styles.btnGreen} onPress={() => finish(task.estimatedMinutes)}>
              <ThemedText style={styles.btnGreenTxt}>✓  Yes, I'm done!</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={() => { setShowDone(false); setShowExtra(true); }}>
              <ThemedText style={styles.btnGhostTxt}>Need more time →</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* "How much more time?" */}
      <Modal transparent animationType="fade" visible={showExtra}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ThemedText style={styles.cardEmoji}>🔄</ThemedText>
            <ThemedText style={styles.cardTitle}>How much more?</ThemedText>
            <ThemedText style={[styles.cardSub, { marginBottom: 16 }]}>
              Pick an extension and keep going
            </ThemedText>
            <View style={styles.chipRow}>
              {EXTRA_OPTS.map(m => (
                <TouchableOpacity key={m} style={styles.chip} onPress={() => addTime(m)}>
                  <ThemedText style={styles.chipTxt}>+{m} min</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => { setShowExtra(false); finish(elapsedMins || task.estimatedMinutes); }}>
              <ThemedText style={styles.btnGhostTxt}>Actually I'm done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* "Finished early" */}
      <Modal transparent animationType="fade" visible={showEarly}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ThemedText style={styles.cardEmoji}>🎉</ThemedText>
            <ThemedText style={styles.cardTitle}>Nice, finished early!</ThemedText>
            <ThemedText style={[styles.cardSub, { marginBottom: 16 }]}>
              How long did it actually take?
            </ThemedText>
            <View style={styles.chipRow}>
              {[5, 10, 15, 20, 30, 45, 60, 90]
                .filter(m => m <= task.estimatedMinutes + 15)
                .map(m => (
                  <TouchableOpacity key={m} style={styles.chip} onPress={() => finish(m)}>
                    <ThemedText style={styles.chipTxt}>{fmtMinutes(m)}</ThemedText>
                  </TouchableOpacity>
                ))}
            </View>
            {elapsedMins > 0 && (
              <TouchableOpacity style={styles.btnGreen} onPress={() => finish(elapsedMins)}>
                <ThemedText style={styles.btnGreenTxt}>Log {fmtMinutes(elapsedMins)} (tracked)</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Styles — original palette, new additions appended
const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Original (pixel-perfect copy) ────────────────────────────────────────
  closeBtn: {
    position: 'absolute',
    top: 56, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  eyebrow: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(226,192,141,0.85)',
    letterSpacing: 2.5,
  },
  taskTitle: {
    fontSize: 34, fontWeight: '700',
    color: '#e8e8f0', lineHeight: 42, letterSpacing: -0.4,
  },
  lightText: { color: '#e8e8f0', textAlign: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 6, paddingHorizontal: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 99, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillTxt: { fontSize: 13, color: '#e8e8f0', fontWeight: '500' },
  reason: { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', lineHeight: 22 },
  actions: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  doneBtn: {
    backgroundColor: '#e2c08d', borderRadius: 18,
    paddingVertical: 18, alignItems: 'center',
  },
  doneBtnTxt: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  deferBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  deferBtnTxt: { fontSize: 15, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  allDone: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },

  // ── New additions ─────────────────────────────────────────────────────────
  pauseBtn: {
    position: 'absolute',
    top: 56, left: 20, zIndex: 10,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
  },
  doneBtnPaused: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  timerBlock: { alignItems: 'center', gap: 10 },
  blockLabel: { color: MUTED, fontSize: 12, letterSpacing: 0.8, textAlign: 'center' },
  timerNum: {
    color: WHITE, fontSize: 68, fontWeight: '200',
    letterSpacing: -2, fontVariant: ['tabular-nums'],
  },
  track: { width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  dotDone:   { backgroundColor: GREEN, borderColor: GREEN },
  dotActive: { backgroundColor: BLUE, borderColor: BLUE, transform: [{ scale: 1.3 }] },
  elapsed:   { color: MUTED, fontSize: 12 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#141e2e',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
  },
  sheetTitle: { color: WHITE, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#1a2535', borderRadius: 24, padding: 28, alignItems: 'center', gap: 6 },
  cardEmoji: { fontSize: 44, marginBottom: 4 },
  cardTitle: { color: WHITE, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  cardSub: { color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btnGreen: {
    backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', width: '100%', marginTop: 8,
  },
  btnGreenTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnGhost: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', width: '100%', marginTop: 4,
  },
  btnGhostTxt: { color: MUTED, fontSize: 14, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 8 },
  chip: {
    backgroundColor: '#1e2d42', borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, paddingHorizontal: 16,
  },
  chipTxt: { color: WHITE, fontSize: 14, fontWeight: '500' },
});