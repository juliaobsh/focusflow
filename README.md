# FocusFlow

An intelligent task prioritization and adaptive focus scheduling app built with **React Native** and **Expo**.

FocusFlow transforms a simple task list into a personalized daily execution system.  
Instead of just storing tasks, it builds a realistic schedule based on urgency, time estimates, and your individual focus rhythm.

## Features

### Personalized Onboarding

- Select peak focus time (morning / afternoon / evening)
- Set daily capacity (max hours per day)
- Define focus duration and break length
- Automatically generates a personalized work window

### Intelligent Scheduling

- Urgency-based prioritization
- Automatic deferral when daily capacity is exceeded
- Waiting task handling (paused tasks)
- Clear separation of:
  - **Today’s Plan**
  - **Deferred Tasks**
  - **Waiting Tasks**

### Focus Mode

One-tap **“What should I work on now?”** flow:

- Highlights highest-priority task
- Displays reasoning
- Starts adaptive countdown timer
- Automatically runs focus/break cycles
- Handles early completion or overtime
- Logs actual time spent

### Adaptive Focus Timer

Supports structured focus sessions.

**Example:**

- Task estimate: 2 hours  
- Focus duration: 45 minutes  
- Break duration: 10 minutes  

FocusFlow will:

1. Run 45 minutes  
2. Trigger 10-minute break  
3. Resume remaining time  
4. Repeat until completion  
5. Ask for final confirmation  

### Analytics

- Time logged
- Estimation accuracy
- Category distribution
- Completion history
- Clear analytics data option

### Demo Mode

Toggle realistic sample tasks on/off for:

- Testing
- Showcasing
- Rapid UI exploration

---

## Tech Stack

- React Native
- Expo
- expo-router (file-based routing)
- AsyncStorage (local persistence)
- react-native-date-picker

---

## Project Structure

```
app/
  (tabs)/
    _layout.tsx
    add-placeholder.tsx
    index.tsx
    explore.tsx
    settings.tsx
  _layout.tsx
  add.tsx
  focus.tsx
  onboarding.tsx

components/
  task-card.tsx
  capacity-bar.tsx
  pause-modal.tsx
  scheduling-intelligence.tsx

lib/
  store.tsx
  helpers.ts
  types.ts
  storage.ts
  demo-data.ts
```

---

## Scheduling Logic

Each task is assigned a dynamic urgency score:

urgency = (priority_weight × 10) / days_until_deadline

Tasks are sorted by urgency and scheduled until the user’s daily capacity is reached.  
Overflow tasks are automatically deferred.

---

## 🚀 Getting Started

### Install dependencies

npm install

### Install required Expo packages

npx expo install react-native-date-picker  
npx expo install @react-native-async-storage/async-storage  

### Start development server

npx expo start

Scan the QR code with Expo Go or run on simulator.

---

## Current Status

MVP complete with:

- Full onboarding flow
- Intelligent scheduling engine
- Adaptive focus timer
- Analytics dashboard
- Demo mode

## Future Improvements

- Cloud sync (Supabase)
- Authentication
- AI-assisted estimation
- Push notifications
- Weekly planning mode

## Why This Project Exists

Most productivity tools optimize for organization.

**FocusFlow optimizes for execution.**

It reduces decision fatigue by answering one question clearly:

> What should I work on right now?
