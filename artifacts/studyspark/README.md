# StudySpark — Smart Study Planner

StudySpark is a responsive personal study planner. It helps students see what
needs attention, track completed work, and review their study time by subject.
It runs in the browser and does not require an account, paid service, API key,
or backend.

## Run locally

From the workspace root:

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/studyspark run dev
```

The Replit preview uses the managed `artifacts/studyspark: web` workflow.

## Features

- Dashboard with today's date, task totals, completed tasks, and completion
  percentage.
- Study tasks with a subject, title, deadline, difficulty, confidence level,
  and estimated study time.
- Active tasks sorted by a transparent priority score, with a breakdown of why
  each task is recommended.
- Completion toggles, removable sample tasks, and local browser persistence.
- Subject-wise study-time and task-completion charts.
- Form validation and empty states for new and cleared planners.
- Layout designed to remain usable on narrow phone screens.

## Priority score

StudySpark uses a deterministic rule-based score from 0 to 100. It is a scoring
algorithm, not a trained AI model.

| Factor | Rule | Points |
| --- | --- | ---: |
| Deadline | Overdue or due today | 50 |
| Deadline | Due in 1 day | 45 |
| Deadline | Due in 2–3 days | 35 |
| Deadline | Due in 4–7 days | 25 |
| Deadline | Due in 8–14 days | 15 |
| Deadline | More than 14 days away | 5 |
| Difficulty | Easy / Medium / Hard | 10 / 20 / 30 |
| Confidence | 1–2 / 3 / 4–5 | 20 / 12 / 5 |

The deadline, difficulty, and confidence points are added together. Higher
scores appear first. Completed tasks are kept for progress and charts but are
not included in active recommendations.

## Task data

Tasks are stored in this browser's local storage. They remain available after a
refresh in the same browser, but are not synced across devices or browsers.
Sample tasks are only added when there is no saved task list, and can be removed
like any other task. Clearing browser site data will remove locally saved tasks.
