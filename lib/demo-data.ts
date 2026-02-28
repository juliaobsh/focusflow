import { Task } from './types';

// Pre-built demo tasks matching the Figma screenshot exactly.
// IDs are stable so we can detect whether demo is loaded.
export const DEMO_TASKS: Omit<Task, 'id' | 'status' | 'createdAt'>[] = [
  // ── Today's schedule ──────────────────────────────────────────────────────
  {
    title: 'Review pull requests from team',
    priority: 3,
    estimatedMinutes: 90,
    category: 'Work',
    deadline: '2026-02-26',
    deferCount: 0,
  },
  {
    title: 'Finish Q1 product roadmap presentation',
    priority: 3,
    estimatedMinutes: 120,
    category: 'Work',
    deadline: '2026-02-27',
    deferCount: 2,
  },
  {
    title: 'Call mom for her birthday',
    priority: 3,
    estimatedMinutes: 30,
    category: 'Personal',
    deadline: '2026-02-27',
    deferCount: 0,
  },
  {
    title: 'Gym - upper body workout',
    priority: 2,
    estimatedMinutes: 60,
    category: 'Health',
    deadline: '2026-02-26',
    deferCount: 0,
  },
  {
    title: 'Flex time / overflow',
    priority: 2,
    estimatedMinutes: 60,
    category: 'Personal',
    deadline: null,
    deferCount: 0,
  },

  // ── Deferred tasks ────────────────────────────────────────────────────────
  {
    title: 'Fix bug in payment processing flow',
    priority: 3,
    estimatedMinutes: 180,
    category: 'Work',
    deadline: null,
    deferCount: 1,
  },
  {
    title: 'Prepare for stakeholder meeting',
    priority: 2,
    estimatedMinutes: 90,
    category: 'Work',
    deadline: null,
    deferCount: 0,
  },
  {
    title: 'Update documentation for API endpoints',
    priority: 2,
    estimatedMinutes: 90,
    category: 'Work',
    deadline: null,
    deferCount: 0,
  },
  {
    title: 'Research cloud migration options',
    priority: 2,
    estimatedMinutes: 120,
    category: 'Work',
    deadline: null,
    deferCount: 0,
  },
  {
    title: 'Plan weekend hiking trip',
    priority: 1,
    estimatedMinutes: 60,
    category: 'Personal',
    deadline: null,
    deferCount: 0,
  },
];

// The one waiting task gets special treatment — needs waitingReason set
export const DEMO_WAITING_TASK: Omit<Task, 'id' | 'createdAt'> = {
  title: 'Coffee with Sarah to discuss side project',
  priority: 1,
  estimatedMinutes: 45,
  category: 'Social',
  deadline: null,
  status: 'waiting',
  waitingReason: 'Waiting on person',
  deferCount: 0,
};