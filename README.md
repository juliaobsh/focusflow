# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


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

app/
  (tabs)/
    index.tsx        # Today
    explore.tsx      # Analytics
    settings.tsx     # Settings
  add.tsx            # Add Task
  focus.tsx          # Focus Mode
  onboarding.tsx     # Personalization

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
