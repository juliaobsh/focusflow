import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Categories, PriorityColors, PriorityLabels, TimeOptions } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/lib/store';

// Format a Date → 'YYYY-MM-DD'
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Parse 'YYYY-MM-DD' → Date (noon UTC to avoid timezone shifts)
const fromYMD = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

// Pretty-print for the button label
const prettyDate = (s: string): string => {
  if (!s) return '';
  try {
    return fromYMD(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return s;
  }
};

export default function AddTaskScreen() {
  const router = useRouter();
  const { addTask } = useStore();
  const colorScheme = useColorScheme() ?? 'light';

  const [title,             setTitle]             = useState('');
  const [estimatedMinutes,  setEstimatedMinutes]  = useState(30);
  const [priority,          setPriority]          = useState<1 | 2 | 3>(2);
  const [category,          setCategory]          = useState('Work');
  const [deadline,          setDeadline]          = useState('');
  const [pickerOpen,        setPickerOpen]        = useState(false);

  const inputBg    = useThemeColor({ light: '#f0f0f5', dark: '#1e1e2e' }, 'background');
  const borderColor = useThemeColor({ light: '#dde0e6', dark: '#2a2a3e' }, 'background');
  const textColor  = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9ba1a6', dark: '#6b7280' }, 'icon');

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Task name required', 'Please enter what you need to do.');
      return;
    }
    addTask({ title: title.trim(), estimatedMinutes, priority, category, deadline: deadline || null });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Task name */}
        <ThemedText type="defaultSemiBold" style={styles.label}>What do you need to do?</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
          placeholder="e.g. Work on portfolio"
          placeholderTextColor={mutedColor}
          value={title}
          onChangeText={setTitle}
          multiline
          autoFocus
        />

        {/* Estimated time */}
        <ThemedText type="defaultSemiBold" style={styles.label}>Estimated Time</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {TimeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setEstimatedMinutes(opt.value)}
              style={[
                styles.chip,
                { backgroundColor: inputBg, borderColor },
                estimatedMinutes === opt.value && styles.chipActive,
              ]}>
              <ThemedText style={[styles.chipText, estimatedMinutes === opt.value && styles.chipTextActive]}>
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Priority */}
        <ThemedText type="defaultSemiBold" style={styles.label}>Priority</ThemedText>
        <View style={styles.priorityRow}>
          {([3, 2, 1] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityBtn,
                { backgroundColor: inputBg, borderColor },
                priority === p && { backgroundColor: PriorityColors[p] + '20', borderColor: PriorityColors[p] },
              ]}>
              <View style={[styles.priorityDot, { backgroundColor: PriorityColors[p] }]} />
              <ThemedText style={[styles.priorityLabel, priority === p && { color: PriorityColors[p] }]}>
                {PriorityLabels[p]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <ThemedText type="defaultSemiBold" style={styles.label}>Category</ThemedText>
        <View style={styles.catGrid}>
          {Categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.chip,
                { backgroundColor: inputBg, borderColor },
                category === cat && styles.chipActive,
              ]}>
              <ThemedText style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deadline — calendar picker */}
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Deadline <ThemedText style={styles.optional}>(optional)</ThemedText>
        </ThemedText>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={[styles.deadlineTrigger, { backgroundColor: inputBg, borderColor }]}
          activeOpacity={0.7}>
          {deadline ? (
            <View style={styles.deadlineRow}>
              <ThemedText style={[styles.deadlineVal, { color: textColor }]}>
                📅  {prettyDate(deadline)}
              </ThemedText>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); setDeadline(''); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ThemedText style={[styles.deadlineClear, { color: mutedColor }]}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <ThemedText style={[styles.deadlinePlaceholder, { color: mutedColor }]}>
              📅  Tap to pick a date
            </ThemedText>
          )}
        </TouchableOpacity>
        <ThemedText style={[styles.hint, { color: mutedColor }]}>
          Closer deadlines boost urgency in your plan
        </ThemedText>

        {/* Date picker modal */}
        <DatePicker
          modal
          open={pickerOpen}
          date={deadline ? fromYMD(deadline) : new Date()}
          mode="date"
          minimumDate={new Date()}
          title="Pick a deadline"
          confirmText="Set Deadline"
          cancelText="Cancel"
          onConfirm={(date) => {
            setPickerOpen(false);
            setDeadline(toYMD(date));
          }}
          onCancel={() => setPickerOpen(false)}
        />

        {/* Add button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          activeOpacity={0.8}>
          <ThemedText style={styles.addBtnText}>Add Task</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 10 },
  label: { marginTop: 6, marginBottom: -2 },
  optional: { fontWeight: '400', opacity: 0.45 },

  input: {
    borderRadius: 12, borderWidth: 1,
    padding: 14, fontSize: 16,
    minHeight: 54, lineHeight: 22,
  },

  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: '#0a7ea420', borderColor: '#0a7ea4' },
  chipText: { fontSize: 13, opacity: 0.65 },
  chipTextActive: { color: '#0a7ea4', opacity: 1, fontWeight: '600' },

  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5,
  },
  priorityDot: { width: 9, height: 9, borderRadius: 5 },
  priorityLabel: { fontSize: 13, fontWeight: '500', opacity: 0.65 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Deadline picker trigger
  deadlineTrigger: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 15,
    minHeight: 52, justifyContent: 'center',
  },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deadlineVal: { fontSize: 15 },
  deadlineClear: { fontSize: 13, opacity: 0.5 },
  deadlinePlaceholder: { fontSize: 15 },

  hint: { fontSize: 12, opacity: 0.38, marginTop: -4 },

  // Add button — text centering fixed with explicit justifyContent
  addBtn: {
    marginTop: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});