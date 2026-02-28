import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DEMO_TASKS } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

const HOURS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const FOCUS_DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60+ min', value: 60 },
];

const FOCUS_TIMES = [
  { label: 'Morning',   value: 'morning'   },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening',   value: 'evening'   },
  { label: 'Varies',    value: 'varies'    },
] as const;

export default function SettingsScreen() {
  const { tasks, settings, updateSettings, clearAll, clearCompletions, loadDemoData, removeDemoData } = useStore();

  const cardBg       = useThemeColor({ light: '#f4f4f8', dark: '#1a1a2e' }, 'background');
  const borderColor  = useThemeColor({ light: '#e0e0ea', dark: '#2a2a45' }, 'background');
  const activeChipBg = useThemeColor({ light: '#3b82f618', dark: '#3b82f630' }, 'background');
  const muted        = useThemeColor({ light: '#6b7280', dark: '#9090b0' }, 'icon');

  const demoActive = DEMO_TASKS.some(d => tasks.find(t => t.title === d.title));
  const toggleDemo = () => (demoActive ? removeDemoData() : loadDemoData());

  const handleClearAll = () => {
    Alert.alert('Clear All Tasks', 'This will permanently delete all tasks.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
    ]);
  };

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: cardBg, borderColor: borderColor },
        active && { backgroundColor: activeChipBg, borderColor: '#3b82f6' },
      ]}>
      <ThemedText style={[styles.chipText, active && styles.chipActive]}>{label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#d0d0d0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={240}
          color="#808080"
          name="chevron.right"
          style={styles.headerImg}
        />
      }>

      <ThemedText type="title">Settings</ThemedText>

      {/* ── Demo Data ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Demo Data</ThemedText>
      <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
        <View style={styles.demoRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText type="defaultSemiBold">Sample tasks</ThemedText>
            <ThemedText style={[styles.hint, { color: muted }]}>
              {demoActive
                ? 'Demo tasks are loaded — toggle off to remove them'
                : 'Load realistic sample tasks to explore the app'}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={toggleDemo}
            style={[styles.toggle, demoActive && styles.toggleOn]}>
            <View style={[styles.toggleThumb, demoActive && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>
        {demoActive && (
          <View style={styles.demoBadge}>
            <ThemedText style={styles.demoBadgeTxt}>
              ✓ {DEMO_TASKS.length} demo tasks loaded
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* ── Daily Capacity ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Daily Capacity</ThemedText>
      <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
        <View style={styles.cardRow}>
          <ThemedText type="defaultSemiBold">Max hours per day</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.accentVal}>
            {settings.maxHoursPerDay}h
          </ThemedText>
        </View>
        <View style={styles.stepRow}>
          {HOURS.map(h => (
            <TouchableOpacity
              key={h}
              onPress={() => updateSettings({ maxHoursPerDay: h })}
              style={[
                styles.step,
                { backgroundColor: cardBg, borderColor: borderColor },
                settings.maxHoursPerDay === h && {
                  backgroundColor: activeChipBg,
                  borderColor: '#3b82f6',
                },
              ]}>
              <ThemedText
                style={[styles.stepTxt, settings.maxHoursPerDay === h && styles.chipActive]}>
                {h}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <ThemedText style={[styles.hint, { color: muted }]}>
          Tasks beyond this limit are deferred automatically
        </ThemedText>
      </ThemedView>

      {/* ── Focus Rhythm ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Focus Rhythm</ThemedText>
      <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
        <ThemedText type="defaultSemiBold">
          How long can you focus before a break?
        </ThemedText>
        <View style={styles.chipWrap}>
          {FOCUS_DURATIONS.map(d => (
            <Chip
              key={d.value}
              label={d.label}
              active={settings.focusDuration === d.value}
              onPress={() => updateSettings({ focusDuration: d.value })}
            />
          ))}
        </View>
      </ThemedView>

      {/* ── Peak Focus Time ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Peak Focus Time</ThemedText>
      <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
        <ThemedText type="defaultSemiBold">
          When do you usually feel most focused?
        </ThemedText>
        <View style={styles.chipWrap}>
          {FOCUS_TIMES.map(t => (
            <Chip
              key={t.value}
              label={t.label}
              active={settings.focusTime === t.value}
              onPress={() => updateSettings({ focusTime: t.value })}
            />
          ))}
        </View>
      </ThemedView>

      {/* ── Re-run Onboarding ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Personalization</ThemedText>
      <TouchableOpacity
        onPress={() => updateSettings({ onboardingComplete: false })}
        style={[styles.outlineBtn, { borderColor: borderColor }]}>
        <ThemedText style={styles.outlineBtnTxt}>Re-run onboarding</ThemedText>
      </TouchableOpacity>

      {/* ── Danger ── */}
      <ThemedText type="subtitle" style={styles.sectionLabel}>Data</ThemedText>
      <TouchableOpacity
        onPress={handleClearAll}
        style={styles.dangerBtn}
        activeOpacity={0.7}>
        <ThemedText style={styles.dangerTxt}>Clear All Tasks</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Clear Analytics',
            'This will delete all completion history and time logs.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCompletions },
            ]
          )
        }
        style={[styles.dangerBtn, { borderColor: '#f59e0b40', backgroundColor: '#f59e0b15' }]}
        activeOpacity={0.7}>
        <ThemedText style={[styles.dangerTxt, { color: '#d97706' }]}>Clear Analytics Data</ThemedText>
      </TouchableOpacity>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImg: { color: '#808080', bottom: -60, right: -30, position: 'absolute' },
  sectionLabel: { marginTop: 4 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accentVal: { color: '#3b82f6', fontSize: 17 },
  hint: { fontSize: 12 },

  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: '#d1d5db', padding: 2, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#3b82f6' },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  demoBadge: {
    backgroundColor: '#eff6ff', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  demoBadgeTxt: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },

  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  step: {
    width: 38, height: 38, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  stepTxt: { fontSize: 14, opacity: 0.6 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 14 },
  chipText: { fontSize: 13, opacity: 0.65 },
  chipActive: { color: '#3b82f6', opacity: 1, fontWeight: '600' },

  outlineBtn: {
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 18,
    borderWidth: 1, alignItems: 'center',
  },
  outlineBtnTxt: { fontSize: 14, fontWeight: '500', opacity: 0.7 },
  dangerBtn: {
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18,
    borderWidth: 1, borderColor: '#ef444440',
    backgroundColor: '#ef444415', alignItems: 'center', marginBottom: 16,
  },
  dangerTxt: { color: '#ef4444', fontWeight: '500', fontSize: 15 },
});