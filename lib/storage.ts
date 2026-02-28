import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletionRecord, Task, UserSettings } from './types';

const KEYS = {
  tasks: 'ff_tasks',
  settings: 'ff_settings',
  completions: 'ff_completions',
};

export const DEFAULT_SETTINGS: UserSettings = {
  maxHoursPerDay: 6,
  workStartTime: '09:00',
  workEndTime: '17:00',
  focusDuration: 45,
  breakDuration: 10,
  focusTime: 'morning',
  taskStartStyle: 'hardest-first',
  categoryWeights: {},
  onboardingComplete: false,
};

// ── tasks ─────────────────────────────────────────────────────────────────────

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.tasks);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try { await AsyncStorage.setItem(KEYS.tasks, JSON.stringify(tasks)); } catch {}
};

// ── settings ──────────────────────────────────────────────────────────────────

export const loadSettings = async (): Promise<UserSettings> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
};

export const saveSettings = async (s: UserSettings): Promise<void> => {
  try { await AsyncStorage.setItem(KEYS.settings, JSON.stringify(s)); } catch {}
};

// ── completion history ────────────────────────────────────────────────────────

export const loadCompletions = async (): Promise<CompletionRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.completions);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveCompletions = async (records: CompletionRecord[]): Promise<void> => {
  try {
    // keep last 100
    const trimmed = records.slice(-100);
    await AsyncStorage.setItem(KEYS.completions, JSON.stringify(trimmed));
  } catch {}
};