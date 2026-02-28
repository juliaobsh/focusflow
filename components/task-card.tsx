import { useState } from 'react';
import { Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { PausePanel } from '@/components/pause-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PriorityColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysBetween, fmtMinutes, formatDeadline, todayStr } from '@/lib/helpers';
import { Task } from '@/lib/types';

// ── Time logger modal ─────────────────────────────────────────────────────────

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];

interface TimeLoggerProps {
  task: Task;
  onConfirm: (actualMinutes: number) => void;
  onSkip: () => void;
}

function TimeLoggerModal({ task, onConfirm, onSkip }: TimeLoggerProps) {
  const [selected, setSelected] = useState<number>(task.estimatedMinutes);
  const [custom, setCustom] = useState('');
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');

  const surface = useThemeColor({ light: '#ffffff', dark: '#1e1e30' }, 'background');
  const border  = useThemeColor({ light: '#e5e7eb', dark: '#2a2a45' }, 'background');
  const muted   = useThemeColor({ light: '#6b7280', dark: '#9090b0' }, 'icon');
  const bg      = useThemeColor({ light: '#f9f9ff', dark: '#12122a' }, 'background');

  const handleConfirm = () => {
    if (mode === 'custom') {
      const parsed = parseInt(custom, 10);
      if (!isNaN(parsed) && parsed > 0) onConfirm(parsed);
      else onConfirm(selected);
    } else {
      onConfirm(selected);
    }
  };

  // Build preset list around the estimated time
  const presets = Array.from(new Set([
    ...TIME_PRESETS.filter(p => p <= task.estimatedMinutes * 2),
    task.estimatedMinutes,
  ])).sort((a, b) => a - b);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={tls.overlay}>
        <ThemedView style={[tls.sheet, { backgroundColor: surface }]}>
          {/* Header */}
          <View style={tls.header}>
            <ThemedText style={tls.emoji}>✅</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={tls.title}>Nice work!</ThemedText>
              <ThemedText style={[tls.sub, { color: muted }]} numberOfLines={1}>
                {task.title}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="defaultSemiBold" style={tls.q}>
            How long did it actually take?
          </ThemedText>
          <ThemedText style={[tls.qSub, { color: muted }]}>
            Estimated: {fmtMinutes(task.estimatedMinutes)} — helps FocusFlow learn your pace
          </ThemedText>

          {/* Preset chips */}
          <View style={tls.presets}>
            {presets.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => { setSelected(p); setMode('presets'); }}
                style={[
                  tls.preset,
                  { backgroundColor: bg, borderColor: border },
                  mode === 'presets' && selected === p && tls.presetOn,
                ]}>
                <ThemedText style={[tls.presetTxt, mode === 'presets' && selected === p && tls.presetTxtOn]}>
                  {fmtMinutes(p)}
                  {p === task.estimatedMinutes && (
                    <ThemedText style={[tls.presetEst, { color: muted }]}> est</ThemedText>
                  )}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom input */}
          <TouchableOpacity onPress={() => setMode('custom')} activeOpacity={0.7}>
            <View style={[
              tls.customRow,
              { backgroundColor: bg, borderColor: mode === 'custom' ? '#3b82f6' : border },
            ]}>
              <TextInput
                style={[tls.customInput, { color: useThemeColor({}, 'text') }]}
                placeholder="Other (minutes)"
                placeholderTextColor={muted}
                keyboardType="number-pad"
                value={custom}
                onFocus={() => setMode('custom')}
                onChangeText={setCustom}
                maxLength={4}
              />
              <ThemedText style={[tls.customUnit, { color: muted }]}>min</ThemedText>
            </View>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={tls.actions}>
            <TouchableOpacity onPress={onSkip} style={[tls.skipBtn, { borderColor: border }]}>
              <ThemedText style={[tls.skipTxt, { color: muted }]}>Skip</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={tls.logBtn}>
              <ThemedText style={tls.logTxt}>Log {mode === 'custom' && custom ? fmtMinutes(parseInt(custom) || selected) : fmtMinutes(selected)}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const tls = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 28 },
  title: { fontSize: 17 },
  sub: { fontSize: 13, marginTop: 2 },
  q: { fontSize: 17 },
  qSub: { fontSize: 13, marginTop: -8, lineHeight: 18 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    borderRadius: 10, borderWidth: 1.5,
    paddingVertical: 9, paddingHorizontal: 14,
  },
  presetOn: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  presetTxt: { fontSize: 13, fontWeight: '500', opacity: 0.7 },
  presetTxtOn: { color: '#3b82f6', opacity: 1, fontWeight: '700' },
  presetEst: { fontSize: 11 },
  customRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  customInput: { flex: 1, fontSize: 15 },
  customUnit: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  skipBtn: { flex: 1, borderRadius: 12, borderWidth: 1.5, paddingVertical: 14, alignItems: 'center' },
  skipTxt: { fontSize: 14, fontWeight: '500' },
  logBtn: { flex: 2, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

// ── TaskCard ──────────────────────────────────────────────────────────────────

interface Props {
  task: Task;
  onComplete: (id: string, actualMinutes?: number) => void;
  onDefer: (id: string) => void;
  onPause?: (id: string, reason: string, resumeAt?: string) => void;
  onResume?: (id: string) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
  done?: boolean;
  isWaiting?: boolean;
}

export function TaskCard({ task, onComplete, onDefer, onPause, onResume, onDelete, muted, done, isWaiting }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showTimeLogger, setShowTimeLogger] = useState(false);

  const cardBg    = useThemeColor({ light: '#f8f8ff', dark: '#1a1a2e' }, 'background');
  const borderColor = useThemeColor({ light: '#e2e4ea', dark: '#2a2a45' }, 'background');
  const actionBg  = useThemeColor({ light: '#f0f0f8', dark: '#12122a' }, 'background');
  const muted_    = useThemeColor({ light: '#6b7280', dark: '#8888a0' }, 'icon');

  const priorityColor = done ? '#4a4a6a' : PriorityColors[task.priority];
  const isUrgent = !done && task.deadline && daysBetween(todayStr(), task.deadline) <= 1;

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => !done && !isWaiting && setExpanded(v => !v)}
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor, borderLeftColor: priorityColor },
          (muted || done) && styles.muted,
          isWaiting && { borderLeftColor: '#f59e0b', opacity: 0.8 },
        ]}>

        <View style={styles.row}>
          <View style={{ flex: 1, gap: 5 }}>
            <ThemedText style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
              {task.title}
            </ThemedText>

            {isWaiting && task.waitingReason && (
              <ThemedText style={styles.waitingTxt}>⏸ {task.waitingReason}</ThemedText>
            )}

            <View style={styles.metaRow}>
              <ThemedText style={styles.meta}>{fmtMinutes(task.estimatedMinutes)}</ThemedText>
              <ThemedText style={[styles.sep, { color: muted_ }]}>·</ThemedText>
              <ThemedText style={styles.meta}>{task.category}</ThemedText>
              {task.deadline && (
                <>
                  <ThemedText style={[styles.sep, { color: muted_ }]}>·</ThemedText>
                  <ThemedText style={[styles.meta, isUrgent && styles.urgent]}>
                    {formatDeadline(task.deadline)}
                  </ThemedText>
                </>
              )}
              {(task.deferCount ?? 0) > 0 && (
                <View style={styles.deferBadge}>
                  <ThemedText style={styles.deferBadgeTxt}>Deferred {task.deferCount}×</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.right}>
            <View style={[styles.dot, { backgroundColor: priorityColor + '35', borderColor: priorityColor }]} />

            {isWaiting ? (
              <TouchableOpacity onPress={() => onResume?.(task.id)} style={styles.resumeBtn}>
                <ThemedText style={styles.resumeTxt}>▶ Resume</ThemedText>
              </TouchableOpacity>
            ) : !done ? (
              <>
                {onPause && (
                  <TouchableOpacity
                    onPress={() => { setShowPause(v => !v); setExpanded(false); }}
                    style={[styles.iconBtn, { backgroundColor: actionBg, borderColor }]}>
                    <ThemedText style={styles.iconTxt}>⏸</ThemedText>
                  </TouchableOpacity>
                )}
                {/* Complete → opens time logger */}
                <TouchableOpacity
                  onPress={() => setShowTimeLogger(true)}
                  style={[styles.iconBtn, { backgroundColor: actionBg, borderColor }]}>
                  <ThemedText style={styles.checkTxt}>✓</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(task.id)}
                  style={[styles.iconBtn, { backgroundColor: actionBg, borderColor }]}>
                  <ThemedText style={styles.deleteTxt}>✕</ThemedText>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>

        {expanded && !done && !isWaiting && (
          <View style={[styles.expanded, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              onPress={() => { onDefer(task.id); setExpanded(false); }}
              style={[styles.actionBtn, { backgroundColor: actionBg, borderColor }]}>
              <ThemedText style={styles.actionTxt}>→  Defer to tomorrow</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {showPause && (
        <PausePanel
          taskTitle={task.title}
          onPause={(reason, resumeAt) => { onPause?.(task.id, reason, resumeAt); setShowPause(false); }}
          onCancel={() => setShowPause(false)}
        />
      )}

      {showTimeLogger && (
        <TimeLoggerModal
          task={task}
          onConfirm={(mins) => { onComplete(task.id, mins); setShowTimeLogger(false); }}
          onSkip={() => { onComplete(task.id); setShowTimeLogger(false); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 3 },
  muted: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  waitingTxt: { fontSize: 12, color: '#d97706', fontWeight: '500' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, opacity: 0.5 },
  sep: { fontSize: 12, opacity: 0.25 },
  urgent: { color: '#ef4444', opacity: 1 },
  deferBadge: { backgroundColor: '#fef3c7', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 },
  deferBadgeTxt: { fontSize: 10, color: '#d97706', fontWeight: '600' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 12, opacity: 0.6 },
  checkTxt: { fontSize: 13, color: '#10b981', fontWeight: '700' },
  deleteTxt: { fontSize: 11, color: '#ef4444', opacity: 0.7 },
  resumeBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  resumeTxt: { fontSize: 12, color: '#fff', fontWeight: '700' },
  expanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  actionBtn: { paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  actionTxt: { fontSize: 13, fontWeight: '500', opacity: 0.6 },
});