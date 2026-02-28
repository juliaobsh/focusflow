import { Task, UserSettings } from './types';

// ── date helpers ──────────────────────────────────────────────────────────────

export const todayStr = (): string =>
  new Date().toISOString().split('T')[0];

export const daysBetween = (from: string, to: string): number => {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
};

export const formatDeadline = (deadline: string): string => {
  const days = daysBetween(todayStr(), deadline);
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `${days}d left`;
};

export const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

export const fmtMinutes = (m: number): string => {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
};

export const genId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// ── scoring breakdown (shown in Scheduling Intelligence panel) ────────────────

export interface ScoreBreakdown {
  baseUrgency: number;
  categoryMultiplier: number;
  freshness: number;
  friction: number;
  total: number;
}

export const calcScoreBreakdown = (task: Task, settings: UserSettings): ScoreBreakdown => {
  // base urgency
  let baseUrgency: number;
  if (!task.deadline) {
    baseUrgency = task.priority * 5;
  } else {
    const days = daysBetween(todayStr(), task.deadline);
    baseUrgency = (task.priority * 10) / Math.max(days, 0.5);
  }

  // category weight multiplier (from onboarding)
  const weight = settings.categoryWeights[task.category] ?? 0.5;
  const categoryMultiplier = Math.round(weight * 10);

  // freshness bonus — tasks deferred get a small bump so they don't get stuck
  const freshness = (task.deferCount ?? 0) > 0 ? 5 : 0;

  // friction penalty — heavier tasks are slightly penalised if task start style is easiest-first
  const friction = settings.taskStartStyle === 'easiest-first' && task.estimatedMinutes > 60 ? -6 :
                   settings.taskStartStyle === 'hardest-first' && task.estimatedMinutes > 60 ? -2 : -4;

  const total = Math.round(baseUrgency + categoryMultiplier + freshness + friction);

  return { baseUrgency: Math.round(baseUrgency), categoryMultiplier, freshness, friction, total };
};

export const calcUrgency = (task: Task, settings?: UserSettings): number => {
  if (!settings) {
    if (!task.deadline) return task.priority * 1.5;
    const days = daysBetween(todayStr(), task.deadline);
    return (task.priority * 10) / Math.max(days, 0.5);
  }
  return calcScoreBreakdown(task, settings).total;
};

// ── scheduling ────────────────────────────────────────────────────────────────

export interface DailyPlan {
  scheduled: Task[];
  deferred: Task[];
  waiting: Task[];
  totalMinutes: number;
}

export const generatePlan = (tasks: Task[], maxMinutes: number, settings?: UserSettings): DailyPlan => {
  const waiting = tasks.filter((t) => t.status === 'waiting');
  const active = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const scored = [...active].sort((a, b) => calcUrgency(b, settings) - calcUrgency(a, settings));

  let totalMinutes = 0;
  const scheduled: Task[] = [];
  const deferred: Task[] = [];

  for (const task of scored) {
    if (totalMinutes + task.estimatedMinutes <= maxMinutes) {
      scheduled.push(task);
      totalMinutes += task.estimatedMinutes;
    } else {
      deferred.push(task);
    }
  }

  return { scheduled, deferred, waiting, totalMinutes };
};

export const getNextTask = (scheduled: Task[]): Task | null =>
  scheduled.find((t) => t.status !== 'done') ?? null;

export const getTaskReason = (task: Task): string => {
  if (!task.deadline) return 'Highest priority task that fits your day';
  const days = daysBetween(todayStr(), task.deadline);
  if (days === 0) return 'Due today · fits your remaining time';
  if (days === 1) return 'Due tomorrow · fits your remaining time';
  return `Due in ${days} days · ${task.priority === 3 ? 'high priority' : 'fits your schedule'}`;
};

// ── analytics helpers ─────────────────────────────────────────────────────────

export const calcEstimationAccuracy = (estimated: number, actual: number): number => {
  if (actual === 0) return 0;
  return Math.round(((estimated - actual) / actual) * 100);
};