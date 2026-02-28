import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const PAUSE_REASONS = [
  'Waiting on someone',
  'Blocked by another task',
  'Need more information',
  'Postponing intentionally',
  'Other',
];

interface PauseModalProps {
  taskTitle: string;
  onPause: (reason: string, resumeAt?: string) => void;
  onCancel: () => void;
}

export function PausePanel({ taskTitle, onPause, onCancel }: PauseModalProps) {
  const [reason, setReason] = useState('');

  const cardBg = useThemeColor({ light: '#fffbeb', dark: '#1e1a0e' }, 'background');
  const borderColor = useThemeColor({ light: '#fde68a', dark: '#3d3200' }, 'background');
  const selectBg = useThemeColor({ light: '#fff', dark: '#1a1a2e' }, 'background');
  const selectBorder = useThemeColor({ light: '#e5e7eb', dark: '#2a2a45' }, 'background');
  const muted = useThemeColor({ light: '#6b7280', dark: '#8888a0' }, 'icon');

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <ThemedText style={styles.question}>Why are you pausing this task?</ThemedText>

      {/* Reason picker */}
      <View style={styles.reasons}>
        {PAUSE_REASONS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setReason(r)}
            style={[
              styles.reasonBtn,
              { backgroundColor: selectBg, borderColor: selectBorder },
              reason === r && styles.reasonBtnActive,
            ]}>
            <ThemedText style={[styles.reasonText, reason === r && styles.reasonTextActive]}>
              {r}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.pauseBtn, !reason && styles.pauseBtnDisabled]}
          onPress={() => reason && onPause(reason)}
          activeOpacity={0.8}>
          <ThemedText style={styles.pauseBtnText}>Pause Task</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <ThemedText style={[styles.cancelText, { color: muted }]}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  question: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  reasons: {
    gap: 6,
  },
  reasonBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  reasonBtnActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  reasonText: {
    fontSize: 14,
    opacity: 0.7,
  },
  reasonTextActive: {
    color: '#d97706',
    opacity: 1,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
  },
  pauseBtn: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pauseBtnDisabled: {
    opacity: 0.4,
  },
  pauseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});