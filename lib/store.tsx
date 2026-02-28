import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEMO_TASKS, DEMO_WAITING_TASK } from './demo-data';
import { genId, todayStr } from './helpers';
import { DEFAULT_SETTINGS, loadCompletions, loadSettings, loadTasks, saveCompletions, saveSettings, saveTasks } from './storage';
import { CompletionRecord, Task, UserSettings } from './types';

interface StoreCtx {
  tasks: Task[];
  settings: UserSettings;
  completions: CompletionRecord[];
  loaded: boolean;
  addTask: (t: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  completeTask: (id: string, actualMinutes?: number) => void;
  deferTask: (id: string) => void;
  pauseTask: (id: string, reason: string, resumeAt?: string) => void;
  resumeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateSettings: (s: Partial<UserSettings>) => void;
  clearAll: () => void;
  loadDemoData: () => void;
  removeDemoData: () => void;
  clearCompletions: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadTasks(), loadSettings(), loadCompletions()]).then(([t, s, c]) => {
      setTasks(t); setSettings(s); setCompletions(c); setLoaded(true);
    });
  }, []);

  useEffect(() => { if (loaded) saveTasks(tasks); }, [tasks, loaded]);
  useEffect(() => { if (loaded) saveSettings(settings); }, [settings, loaded]);
  useEffect(() => { if (loaded) saveCompletions(completions); }, [completions, loaded]);

  const addTask = useCallback((t: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...t, id: genId(), status: 'pending', createdAt: todayStr(), deferCount: t.deferCount ?? 0 }]);
  }, []);

  const completeTask = useCallback((id: string, actualMinutes?: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, status: 'done' as const, completedAt: new Date().toISOString(), actualMinutes };
      if (actualMinutes) {
        setCompletions(c => [...c, {
          taskId: t.id, title: t.title, category: t.category,
          estimatedMinutes: t.estimatedMinutes, actualMinutes,
          completedAt: new Date().toISOString(),
        }]);
      }
      return updated;
    }));
  }, []);

  const deferTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'deferred' as const, deferCount: (t.deferCount ?? 0) + 1 } : t
    ));
  }, []);

  const pauseTask = useCallback((id: string, reason: string, resumeAt?: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'waiting' as const, waitingReason: reason, waitingResumeAt: resumeAt } : t
    ));
  }, []);

  const resumeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'pending' as const, waitingReason: undefined, waitingResumeAt: undefined } : t
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateSettings = useCallback((s: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const clearAll = useCallback(() => setTasks([]), []);
  const clearCompletions = useCallback(() => setCompletions([]), []);

  const loadDemoData = useCallback(() => {
    const demoTitles = new Set([...DEMO_TASKS.map(d => d.title), DEMO_WAITING_TASK.title]);
    setTasks(prev => {
      // remove any existing demo tasks first, then add fresh
      const filtered = prev.filter(t => !demoTitles.has(t.title));
      const newTasks: Task[] = [
        ...DEMO_TASKS.map(d => ({
          ...d, id: genId(), status: 'pending' as const, createdAt: todayStr(),
        })),
        { ...DEMO_WAITING_TASK, id: genId(), createdAt: todayStr() },
      ];
      return [...filtered, ...newTasks];
    });
  }, []);

  const removeDemoData = useCallback(() => {
    const demoTitles = new Set([...DEMO_TASKS.map(d => d.title), DEMO_WAITING_TASK.title]);
    setTasks(prev => prev.filter(t => !demoTitles.has(t.title)));
  }, []);

  return (
    <Ctx.Provider value={{
      tasks, settings, completions, loaded,
      addTask, completeTask, deferTask, pauseTask, resumeTask,
      deleteTask, updateSettings, clearAll, clearCompletions, loadDemoData, removeDemoData,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}