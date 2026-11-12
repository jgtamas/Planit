# Planit

**All your school, one orbit.**

Planit is a connective planner for high school students. Students juggle assignments across Canvas, Blackbaud, Apple Reminders, and Google Calendar; Planit pulls them into one calm view, and when a teacher posts the same assignment in two places, Planit merges the duplicates so it only shows up once.

> This is a minimum viable product built for an AP Business class demo. There are **no real integrations**: connecting an account is simulated, and all imported data is realistic sample data generated relative to today's date, so the demo never looks stale.

## Features

- **Onboarding:** name, grade, and a simulated "Connect your accounts" step
- **Today dashboard:** greeting, an orbit progress ring, tonight's total workload, and Overdue / Due today / Coming up / Done sections
- **Smart Prioritization:** a "Do this next" card ranks open work by due date, weight (test > quiz > assignment > homework), priority, and estimated time, and shows *why* ("Test in 2 days · High priority · ~2h of work")
- **Time Estimates:** every task has an estimated duration (suggested by type, editable in the drawer), and Today totals the night's load ("~4h 45m tonight")
- **Focus Mode:** a Pomodoro timer tied to a task (Demo 1 min / 15 / 25 / 50), with a "launch into orbit" animation, pause/resume, session logging, and XP rewards
- **Workload Heatmap:** Week → **Workload** shows a month colored by how heavy each day is, flags the crunch week, and lists a day's items on click
- **Orbit Levels:** finishing tasks and focus sessions earns XP that grows your planet: a ring, then a moon, aurora colors, a second moon, and finally a star system. Level-ups get a celebration screen.
- **Quick-add with natural language:** `Bio lab report friday`, `Chem quiz thursday high priority`, `Study for APUSH test tomorrow 2h`, `Read ch 5 next week`. It detects the date, time, class, task type, priority, and time estimate.
- **Duplicate merging:** items found in both Canvas and Blackbaud appear once, with both source tags and a "Merged" label
- **Week view:** 7-day calendar, color-coded by source, with prev/next week navigation (stacks on mobile)
- **Classes:** a card per course with this week's count and the next due item; click one to see all of its work
- **Connections:** connect/disconnect, item counts, "last synced" times, and Sync now
- **Task drawer:** edit title, due date, class, priority, and notes, or delete the task
- **Settings:** dark/light theme, name, grade, and **Reset demo**
- Responsive: sidebar on desktop, bottom tab bar on phones.
- **Fresh demo in every tab:** state lives in `sessionStorage`, so each newly opened tab starts at onboarding, and any number of people can use the live link at once without affecting each other. Reloading the same tab keeps your progress.

## Run it locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

To make a production build:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel detects Vite automatically (build command `npm run build`, output directory `dist`). Click **Deploy**.

No environment variables or backend are needed. The build uses relative asset paths (`base: './'`), so the `dist` folder also works as-is on GitHub Pages or any static host.

## 90-second demo script

The pitch in one line: **Planit doesn't just collect your assignments, it tells you what to do next.**

1. **(Before class)** Open the site in a new tab: it always starts fresh at onboarding. (Settings → Reset demo does the same mid-session.)
2. **Onboarding (10s):** "This is Planit — all your school, one orbit." Click **Get started**, type your name, pick a grade.
3. **Connect (10s):** Click **Connect** on all four accounts. Point out the "Imported X items" confirmations. Click **Enter your orbit**.
4. **Today (10s):** "Everything from four apps in one place." Point out the orbit ring and **~4h 45m tonight**: "Planit knows how long your night is."
5. **Do this next (10s):** "Instead of a to-do pile, Planit tells me what to start." Read the reason chips aloud. Mention that the top item is a **Canvas + Blackbaud · Merged** assignment, so duplicates show up once.
6. **Complete a task + level up (10s):** Check off any task. The demo starts 18 XP short of Level 3, so **any** completed task triggers the level-up: "My planet just gained its first moon." Click **Keep orbiting**.
7. **Focus Mode (15s):** On the Do this next card, click **Start focus**, pick **Demo (1 min)**, then **Launch into orbit**. Show the countdown, then click **End session** (or let the minute finish to show the XP reward).
8. **Workload heatmap (10s):** Go to **Week → Workload**: "You can see crunch weeks coming." Hover or click the darkest day.
9. **Quick-add (5s):** Type `Chem quiz thursday high priority` and show the preview pick up the date, class, type, and priority. Press Enter.
10. **Close (5s):** On **Connections**: "Coming soon: Schoology, Google Classroom, and Notion."

## Project structure

```
src/
  components/   PlanitLogo, OrbitPlanet (level planet), Layout, TaskCard, TaskDrawer,
                QuickAdd, DoNext, FocusMode, Heatmap, Levels, OrbitRing, SourceTag, ui
  pages/        Today, Week (week grid + workload heatmap), Classes, Connections,
                Onboarding, Settings
  data/         mockData.ts: courses and ~35 raw records relative to today
  lib/          store (React context + sessionStorage), planning.ts (estimates +
                prioritization), levels.ts (XP + Orbit Levels), parse.ts (quick-add),
                dedupe.ts (duplicate merging), dates.ts, sources.ts, storage.ts
  types/        Task, Course, Connection, Settings, SourceId
public/
  favicon.svg   the Planit logo
```

Built with React, TypeScript, Vite, Tailwind CSS, lucide-react, and date-fns.
