import Slider from '@react-native-community/slider';
import { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Categories } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/lib/store';

const TOTAL_STEPS = 4;

const FOCUS_TIMES = [
  { label: 'Morning',   sub: '6 AM – 12 PM',  value: 'morning'   as const },
  { label: 'Afternoon', sub: '12 PM – 6 PM',  value: 'afternoon' as const },
  { label: 'Evening',   sub: '6 PM – 12 AM',  value: 'evening'   as const },
  { label: 'It Varies', sub: 'Different each day', value: 'varies' as const },
];

const FOCUS_DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const BREAK_DURATIONS = [
  { label: '5 min',  value: 5  },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
];

const WEIGHT_LABELS: Record<number, string> = {
  0: 'Low', 0.25: 'Below average', 0.5: 'Average', 0.75: 'High priority', 1: 'Critical',
};
const snapWeight = (v: number) => Math.round(v * 4) / 4;
const weightLabel = (v: number) => WEIGHT_LABELS[snapWeight(v)] ?? 'Average';

/** Derive a sensible start/end from focus preference + hours */
const deriveWindow = (
  focusTime: 'morning' | 'afternoon' | 'evening' | 'varies',
  hours: number
) => {
  const pad = (h: number) => `${String(Math.min(h, 23)).padStart(2, '0')}:00`;
  const anchors: Record<string, number> = {
    morning: 7, afternoon: 12, evening: 18, varies: 9,
  };
  const start = anchors[focusTime] ?? 9;
  return { start: pad(start), end: pad(start + hours) };
};

// ─────────────────────────────────────────────────────────────────────────────

interface OnboardingProps { visible: boolean; onComplete: () => void; }

export function OnboardingModal({ visible, onComplete }: OnboardingProps) {
  const { settings, updateSettings } = useStore();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState(0);
  const [focusTime,     setFocusTime]     = useState(settings.focusTime);
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [maxHours,      setMaxHours]      = useState(settings.maxHoursPerDay);
  const [workStart,     setWorkStart]     = useState(settings.workStartTime);
  const [workEnd,       setWorkEnd]       = useState(settings.workEndTime);
  const [taskStartStyle, setTaskStartStyle] = useState(settings.taskStartStyle);
  const [catWeights,    setCatWeights]    = useState<Record<string, number>>(
    Categories.reduce((acc, c) => ({ ...acc, [c]: settings.categoryWeights[c] ?? 0.5 }), {})
  );

  const surface = useThemeColor({ light: '#ffffff', dark: '#1e1e30' }, 'background');
  const border  = useThemeColor({ light: '#e5e7eb', dark: '#2a2a45' }, 'background');
  const muted   = useThemeColor({ light: '#6b7280', dark: '#9090b0' }, 'icon');

  const handleComplete = () => {
    updateSettings({
      focusTime, focusDuration, breakDuration,
      maxHoursPerDay: maxHours,
      workStartTime: workStart, workEndTime: workEnd,
      taskStartStyle, categoryWeights: catWeights,
      onboardingComplete: true,
    });
    onComplete();
  };

  const goNext = () => {
    if (step === 0) {
      // Auto-fill work window based on focus time + hours before going to step 2
      const w = deriveWindow(focusTime, maxHours);
      setWorkStart(w.start);
      setWorkEnd(w.end);
    }
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else handleComplete();
  };
  const goBack = () => setStep(s => s - 1);

  // Shared pill
  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, { backgroundColor: surface, borderColor: border }, active && styles.pillOn]}>
      <ThemedText style={[styles.pillTxt, active && styles.pillTxtOn]}>{label}</ThemedText>
    </TouchableOpacity>
  );

  // ── Steps ─────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      // ── Step 1 ─────────────────────────────────────────────────────────
      case 0: return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.badge}><ThemedText style={styles.badgeTxt}>⚡</ThemedText></View>
          <ThemedText type="defaultSemiBold" style={styles.title}>When are you most focused?</ThemedText>
          <ThemedText style={[styles.sub, { color: muted }]}>We'll schedule your hardest tasks during this time</ThemedText>

          <View style={styles.grid}>
            {FOCUS_TIMES.map(ft => (
              <TouchableOpacity
                key={ft.value} onPress={() => setFocusTime(ft.value)}
                style={[styles.gridCard, { backgroundColor: surface, borderColor: border }, focusTime === ft.value && styles.gridCardOn]}>
                <ThemedText style={[styles.gridCardTitle, focusTime === ft.value && styles.blue]}>{ft.label}</ThemedText>
                <ThemedText style={[styles.gridCardSub, { color: muted }]}>{ft.sub}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={[styles.q, { color: muted }]}>How long can you focus before needing a break?</ThemedText>
          <View style={styles.pillRow}>
            {FOCUS_DURATIONS.map(d => <Pill key={d.value} label={d.label} active={focusDuration === d.value} onPress={() => setFocusDuration(d.value)} />)}
          </View>

          <ThemedText style={[styles.q, { color: muted }]}>How long should your breaks be?</ThemedText>
          <View style={styles.pillRow}>
            {BREAK_DURATIONS.map(d => <Pill key={d.value} label={d.label} active={breakDuration === d.value} onPress={() => setBreakDuration(d.value)} />)}
          </View>
        </ScrollView>
      );

      // ── Step 2 ─────────────────────────────────────────────────────────
      case 1: {
        const suggested = deriveWindow(focusTime, maxHours);
        const isAuto = workStart === suggested.start && workEnd === suggested.end;
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.badge}><ThemedText style={styles.badgeTxt}>🕐</ThemedText></View>
            <ThemedText type="defaultSemiBold" style={styles.title}>How much time for focused work?</ThemedText>
            <ThemedText style={[styles.sub, { color: muted }]}>Research shows most people can do 3–6 hours of deep work daily</ThemedText>

            <View style={styles.sliderHeader}>
              <ThemedText style={[styles.q, { color: muted }]}>Daily work hours</ThemedText>
              <ThemedText style={styles.sliderNum}>{maxHours}h</ThemedText>
            </View>
            <Slider
              style={styles.slider} minimumValue={2} maximumValue={10} step={1} value={maxHours}
              onValueChange={v => {
                setMaxHours(v);
                const w = deriveWindow(focusTime, v);
                setWorkStart(w.start); setWorkEnd(w.end);
              }}
              minimumTrackTintColor="#3b82f6" maximumTrackTintColor={border} thumbTintColor="#3b82f6"
            />
            <View style={styles.sliderHints}>
              {['2h (minimal)', '6h (optimal)', '10h (max)'].map(l => (
                <ThemedText key={l} style={[styles.sliderHint, { color: muted }]}>{l}</ThemedText>
              ))}
            </View>

            <View style={[styles.tip, { backgroundColor: isDark ? '#1c2a1c' : '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <ThemedText style={styles.tipTxt}>
                💡 <ThemedText style={styles.tipBold}>Tip:</ThemedText> Start conservative — it's better to finish and feel accomplished than to overcommit.
              </ThemedText>
            </View>

            <View style={styles.windowRow}>
              <ThemedText style={[styles.q, { color: muted }]}>Work window</ThemedText>
              {isAuto && (
                <View style={styles.autoBadge}>
                  <ThemedText style={styles.autoBadgeTxt}>✨ Auto-filled from {focusTime} preference</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.timeRow}>
              {[{ label: 'Start', val: workStart }, { label: 'End', val: workEnd }].map((item, i) => (
                <View key={i} style={[styles.timeBox, { backgroundColor: surface, borderColor: border }]}>
                  <ThemedText style={[styles.timeLabel, { color: muted }]}>{item.label}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.timeVal}>{item.val}</ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={[styles.presetNote, { color: muted }]}>Tap a preset to override:</ThemedText>
            <View style={styles.presetRow}>
              {[
                ['06:00', `${String(6  + maxHours).padStart(2,'0')}:00`],
                ['08:00', `${String(8  + maxHours).padStart(2,'0')}:00`],
                ['09:00', `${String(9  + maxHours).padStart(2,'0')}:00`],
                ['12:00', `${String(12 + maxHours).padStart(2,'0')}:00`],
                ['18:00', `${String(Math.min(18 + maxHours, 23)).padStart(2,'0')}:00`],
              ].map(([s, e]) => (
                <TouchableOpacity
                  key={s} onPress={() => { setWorkStart(s); setWorkEnd(e); }}
                  style={[styles.preset, { backgroundColor: surface, borderColor: border }, workStart === s && styles.pillOn]}>
                  <ThemedText style={[styles.presetTxt, workStart === s && styles.pillTxtOn]}>{s}–{e}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );
      }

      // ── Step 3 ─────────────────────────────────────────────────────────
      case 2: return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.badge}><ThemedText style={styles.badgeTxt}>🎯</ThemedText></View>
          <ThemedText type="defaultSemiBold" style={styles.title}>How do you like to start your day?</ThemedText>
          <ThemedText style={[styles.sub, { color: muted }]}>Everyone has a different approach</ThemedText>

          <View style={styles.styleCards}>
            {[
              { value: 'hardest-first' as const, icon: '🐸', label: 'Eat the frog (hardest first)', desc: "Tackle the most challenging task when you're freshest. Get the hard stuff done early." },
              { value: 'easiest-first' as const, icon: '🚀', label: 'Warm up (easy first)',          desc: "Start with quick wins to build momentum. Save harder tasks for when you're warmed up." },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value} onPress={() => setTaskStartStyle(opt.value)}
                style={[styles.styleCard, { backgroundColor: surface, borderColor: border }, taskStartStyle === opt.value && styles.styleCardOn]}>
                <View style={styles.styleCardRow}>
                  <ThemedText style={styles.styleIcon}>{opt.icon}</ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={taskStartStyle === opt.value && styles.blue}>{opt.label}</ThemedText>
                    <ThemedText style={[styles.styleDesc, { color: muted }]}>{opt.desc}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary of what you've picked so far */}
          <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={[styles.summaryTitle, { color: muted }]}>YOUR FOCUS PROFILE SO FAR</ThemedText>
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryIcon}>⚡</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.summaryLabel, { color: muted }]}>Peak focus time</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.summaryVal}>
                    {focusTime === 'morning' ? 'Morning (6 AM – 12 PM)' :
                     focusTime === 'afternoon' ? 'Afternoon (12 PM – 6 PM)' :
                     focusTime === 'evening' ? 'Evening (6 PM – 12 AM)' : 'Varies day to day'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryIcon}>🕐</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.summaryLabel, { color: muted }]}>Daily hours</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.summaryVal}>
                    {maxHours}h · {workStart} – {workEnd}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryIcon}>⏱</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.summaryLabel, { color: muted }]}>Focus blocks</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.summaryVal}>
                    {focusDuration} min focus · {breakDuration} min break
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      );

      // ── Step 4 ─────────────────────────────────────────────────────────
      case 3: return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.badge}><ThemedText style={styles.badgeTxt}>📊</ThemedText></View>
          <ThemedText type="defaultSemiBold" style={styles.title}>What matters most to you right now?</ThemedText>
          <ThemedText style={[styles.sub, { color: muted }]}>We'll prioritize these categories in your schedule</ThemedText>

          <View style={styles.catList}>
            {Categories.map(cat => {
              const val = catWeights[cat] ?? 0.5;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={styles.catRowHead}>
                    <ThemedText type="defaultSemiBold">{cat}</ThemedText>
                    <ThemedText style={styles.catVal}>{weightLabel(val)}</ThemedText>
                  </View>
                  <Slider
                    style={styles.slider} minimumValue={0} maximumValue={1} step={0.25} value={val}
                    onValueChange={v => setCatWeights(p => ({ ...p, [cat]: v }))}
                    minimumTrackTintColor="#3b82f6" maximumTrackTintColor={border} thumbTintColor="#3b82f6"
                  />
                </View>
              );
            })}
          </View>

          <View style={[styles.tip, { backgroundColor: isDark ? '#1c2a1c' : '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <ThemedText style={styles.tipTxt}>
              ✨ <ThemedText style={styles.tipBold}>Good news:</ThemedText> FocusFlow will learn from your behavior over time and automatically improve your schedule.
            </ThemedText>
          </View>
        </ScrollView>
      );
    }
  };

  const btnLabel = step === TOTAL_STEPS - 1 ? 'Start Using FocusFlow' : 'Continue';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            Let's personalize FocusFlow for you
          </ThemedText>
          <View style={styles.progress}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i <= step ? '#fff' : 'rgba(255,255,255,0.28)' }]} />
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>{renderStep()}</View>

        <View style={[styles.footer, { borderTopColor: border }]}>
          {step > 0 ? (
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={goBack} style={[styles.backBtn, { borderColor: border }]}>
                <ThemedText style={[styles.backTxt, { color: muted }]}>Back</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
                <ThemedText style={styles.nextTxt}>{btnLabel}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
                <ThemedText style={styles.nextTxt}>Continue</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#4f46e5',
    paddingTop: Platform.OS === 'ios' ? 24 : 20,
    paddingBottom: 20, paddingHorizontal: 20, gap: 14,
  },
  headerTitle: { color: '#fff', fontSize: 19, lineHeight: 26 },
  progress: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 4, borderRadius: 2 },

  scroll: { padding: 20, paddingBottom: 24, gap: 14 },
  badge: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(79,70,229,0.12)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start',
  },
  badgeTxt: { fontSize: 24 },
  title: { fontSize: 21, lineHeight: 28 },
  sub: { fontSize: 14, lineHeight: 20 },
  q: { fontSize: 14 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '48%', borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 4 },
  gridCardOn: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  gridCardTitle: { fontSize: 15, fontWeight: '600' },
  gridCardSub: { fontSize: 12 },
  blue: { color: '#3b82f6' },

  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, borderRadius: 10, borderWidth: 1.5, paddingVertical: 11, alignItems: 'center' },
  pillOn: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  pillTxt: { fontSize: 13, fontWeight: '500', opacity: 0.7 },
  pillTxtOn: { color: '#3b82f6', opacity: 1, fontWeight: '700' },

  slider: { width: '100%', height: 38 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderNum: { fontSize: 20, fontWeight: '700', color: '#3b82f6' },
  sliderHints: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  sliderHint: { fontSize: 11 },

  tip: { borderRadius: 12, borderWidth: 1, padding: 14 },
  tipTxt: { fontSize: 14, lineHeight: 20 },
  tipBold: { fontWeight: '700' },

  windowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  autoBadge: { backgroundColor: '#eff6ff', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  autoBadgeTxt: { fontSize: 11, color: '#3b82f6', fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 10 },
  timeBox: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  timeLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  timeVal: { fontSize: 17 },
  presetNote: { fontSize: 12 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: { borderRadius: 8, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 11 },
  presetTxt: { fontSize: 12, opacity: 0.7 },

  styleCards: { gap: 12 },
  styleCard: { borderRadius: 14, borderWidth: 1.5, padding: 16 },
  styleCardOn: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  styleCardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  styleIcon: { fontSize: 26, marginTop: 1 },
  styleDesc: { fontSize: 13, lineHeight: 19, marginTop: 4 },

  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  summaryTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  summaryRows: { gap: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summaryIcon: { fontSize: 18, marginTop: 1 },
  summaryLabel: { fontSize: 11, marginBottom: 1 },
  summaryVal: { fontSize: 14 },

  catList: { gap: 18 },
  catRow: { gap: 2 },
  catRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catVal: { fontSize: 13, fontWeight: '600', color: '#3b82f6' },

  footer: {
    borderTopWidth: 1, padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
  },
  footerRow: { flexDirection: 'row', gap: 10 },
  backBtn: { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  backTxt: { fontSize: 15, fontWeight: '600' },
  nextBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  nextTxtWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});