export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'deferred' | 'waiting';

export interface Task {
  id: string;
  title: string;
  deadline: string | null;       // 'YYYY-MM-DD' or null
  priority: 1 | 2 | 3;          // 1=Low 2=Med 3=High
  estimatedMinutes: number;
  actualMinutes?: number;        // filled in when task is completed
  category: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  // waiting state
  waitingReason?: string;
  waitingResumeAt?: string;      // ISO time string
  // deferred tracking
  deferCount?: number;
}

export interface UserSettings {
  maxHoursPerDay: number;
  workStartTime: string;         // '09:00'
  workEndTime: string;           // '17:00'
  focusDuration: number;         // minutes before break
  breakDuration: number;         // break length in minutes
  focusTime: 'morning' | 'afternoon' | 'evening' | 'varies';
  taskStartStyle: 'hardest-first' | 'easiest-first';
  categoryWeights: Record<string, number>; // 0-1 weight per category
  onboardingComplete: boolean;
}

export interface CompletionRecord {
  taskId: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completedAt: string;
}