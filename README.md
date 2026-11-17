# Weekly Task Planner — To-Do List

[![React](https://img.shields.io/badge/React-19.3.1-149eca?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.6-646cff?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.5-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-not_specified-lightgrey.svg)](#)

**Live deployed link (Netlify):** [Add deployment URL](#)

**Demo video / GIF walkthrough:** [Add demo link](#)

**Figma UI design:** [https://figma.com](https://figma.com)

## Project Overview

Weekly Task Planner is a mobile-first task-planning application for organizing tasks from Monday through Sunday. Users can browse a week or an individual day, create and edit scheduled tasks, mark tasks open or completed, delete tasks, filter by status and priority, and search by keyword. Weekly summary cards and a progress bar make open and completed work visible at a glance.

> **Repository scope:** This repository contains the React/Vite frontend. Its sibling `todo-express5-backend/` provides the API contract documented here; the frontend repo itself does not contain the backend source.

## Public landing and guest demo

- `/` is a public product landing page with an interactive weekly-progress preview and one-tap Web Audio/vibration chime test. Signed-in users can jump directly to their workspace.
- `/demo` reuses the planner, task form, weekly cards, search overlay, status actions, and swipe-to-delete UI with a local-only task store. Opening the demo directly skips auth-session hydration and does not issue task, workspace, search, or alarm API requests.
- First visit seeds realistic tasks across last week, the current week, and next week. Demo changes persist in `localStorage` under `guest_sandbox_tasks`; **Reset Demo Data** restores the sample set.
- The client groups guest tasks into Monday–Sunday week summaries with the same `weekStart`, `weekEnd`, `openCount`, `completedCount`, and task-list fields as the server summary.
- After registration, the authenticated workspace offers a one-tap import. Tasks are sent to the new workspace one at a time; each successfully imported task is removed from the local queue, and any remaining tasks stay in the browser if a request fails.
- `/login` and `/register` remain public auth screens. `/app` and `/dashboard` are protected and redirect unauthenticated visitors to `/login`.

## Key Features & User Flows

### Task management

- **Create:** Use **Add New Task** or the mobile floating add button. The form collects a title, date, time, priority, and optional description. The client rejects a blank/whitespace-only title, missing date, or missing time before submitting. The title is limited to 150 characters and description to 1,000 characters.
- **Edit:** Select the edit action on a task; the form is populated with its current values. Saving updates the task and moves it to the appropriate week if its scheduled date changes.
- **Complete / reopen:** Select the task checkbox to toggle between `Completed` and `In Progress`. The weekly counts update optimistically and are restored if the API request fails.
- **Delete:** Use the delete action and confirm or cancel. On touch screens, swipe a task row left to reveal the delete action, then confirm. The delete is optimistic and is rolled back if the request fails.
- **Keyword search:** Open Search and enter a query. Requests are debounced by 200 ms, are canceled when superseded or closed, and are sent as the `search` query parameter. Search result matching is performed by the backend; the frontend displays the returned results and supports the same task actions.

### Weekly organization (Monday–Sunday)

- The calendar always renders seven days beginning Monday. Previous/next controls navigate in seven-day increments; users can select a day, jump to today, or view the whole week.
- The frontend requests a server-generated weekly summary using the browser's IANA timezone in the `timezone` query parameter. Each summary contains the week's `weekStart`, task list, and total/open/completed counts.
- The summary cards display completed and open task counts for the selected week. Selecting a card filters the task list by that status. The progress bar is `completedTasksCount / totalTasksCount` (0% for an empty week).
- Creating, moving, deleting, and changing the status of tasks updates local task lists and counters immediately. Successful mutations trigger a summary refresh; failed optimistic mutations are rolled back.
- Date utilities use local calendar dates to find Monday at midnight and generate the following six days. Date-only week starts are parsed as local dates to avoid shifting the selected week because of UTC parsing.

### Accounts, workspaces, and roles

- Login and registration restore an access token in application memory; the refresh token is kept in the backend's HttpOnly cookie. Protected requests include the active `x-workspace-id` header.
- A shared refresh request handles concurrent 401 responses and retries protected API calls after rotating the refresh cookie.
- Workspaces can be switched from the header pill. Workspace owners and admins can add existing registered users; only owners can change member roles.
- `VIEWER` members get read-only task access: task creation, status changes, editing, and deletion controls are hidden or disabled.

### Notification preferences and phone alarms

- Alert settings are saved through `PATCH /api/auth/notifications`. Phone numbers are validated as E.164, WhatsApp requires a valid phone number, and the lead time can be set to 15, 30, or 60 minutes.
- Task forms submit selected reminder channels (`EMAIL`, `WHATSAPP`, and `MOBILE_ALARM`) as `reminderConfig`; task dates are sent as ISO-8601 UTC strings.
- While signed in with mobile alarms enabled, the app polls `GET /api/tasks/upcoming-alarms` every 60 seconds. Eligible tasks trigger a synthesized Web Audio chime and browser vibration when supported, with snooze, dismiss, and completion actions.
- Open task cards can download an authenticated `.ics` event from `GET /api/tasks/:id/alarm.ics` for importing into a device calendar.
- The calendar feed URL uses `GET /api/calendar/feed/:userId.ics`. This route is authenticated, so calendar providers that fetch URLs independently cannot use it without a backend-supported calendar token. The settings dialog calls out this limitation.
- The backend currently exposes notification settings through the save response but has no read endpoint. After a full reload, the frontend must use the documented defaults until settings can be fetched; saved server-side preferences cannot currently be prefilled from the API.

### Mobile-first responsive UI

The interface uses Tailwind CSS utility classes with small-screen defaults and `sm:` / `lg:` breakpoints. The task form and search overlay become bottom sheets on narrow screens, the add action becomes a fixed floating button, and the calendar/task workspace changes to a two-column layout at large widths. Task rows support a horizontal swipe gesture while preserving vertical scrolling.

## Tech Stack

Versions below are the declared versions in the root `package.json` (ranges use npm semver notation).

### Frontend dependencies

| Package        | Declared version | Use               |
| -------------- | ---------------: | ----------------- |
| `axios`        |        `^1.21.1` | HTTP client       |
| `lucide-react` |        `^1.72.0` | UI icons          |
| `react`        |        `^19.3.1` | UI framework      |
| `react-dom`    |        `^19.3.1` | Browser rendering |

### Frontend development dependencies

| Package                       | Declared version | Use                            |
| ----------------------------- | ---------------: | ------------------------------ |
| `@eslint/js`                  |        `^10.0.1` | ESLint core rules              |
| `@tailwindcss/vite`           |         `^4.3.5` | Tailwind CSS Vite integration  |
| `@types/react`                |        `^19.3.0` | React type definitions         |
| `@types/react-dom`            |        `^19.3.0` | React DOM type definitions     |
| `@vitejs/plugin-react`        |         `^6.1.2` | React support for Vite         |
| `eslint`                      |       `^10.14.0` | Linting                        |
| `eslint-plugin-react-hooks`   |         `^7.1.1` | React Hooks lint rules         |
| `eslint-plugin-react-refresh` |         `^0.5.7` | React Fast Refresh lint rules  |
| `globals`                     |       `^17.13.0` | ESLint browser globals         |
| `tailwindcss`                 |         `^4.3.5` | Utility-first CSS              |
| `vite`                        |         `^8.3.6` | Development server and bundler |

### Backend

The backend is maintained in the sibling `todo-express5-backend/` project and must be run separately from this frontend.

## System Architecture & Folder Structure

```text
todo-react-frontend/
├── public/
│   └── favicon.svg                 # Browser favicon
├── src/
│   ├── api/
│   │   ├── authApi.js              # In-memory access token and refresh interceptor
│   │   ├── alertApi.js             # Notification preferences and alarm endpoints
│   │   ├── taskApi.js              # Task API requests
│   │   └── workspaceApi.js         # Workspace and member API requests
│   ├── components/
│   │   ├── AuthScreen.jsx          # Mobile login and registration screens
│   │   ├── MobileAlarmBanner.jsx   # Snooze, dismiss, and quick-complete alarm UI
│   │   ├── NotificationSettingsModal.jsx # Phone and notification preferences
│   │   ├── OnboardingScreen.jsx    # First-visit welcome screen
│   │   ├── PlannerPage.jsx         # Main page and component composition
│   │   ├── SearchOverlay.jsx       # Debounced task search dialog
│   │   ├── TaskDialogLayer.jsx     # Task form and search dialog layer
│   │   ├── TaskFormModal.jsx       # Create/edit form and client validation
│   │   ├── TaskListPanel.jsx       # Task list, loading and empty/error states
│   │   ├── TaskRowItem.jsx         # Task actions and mobile swipe-to-delete
│   │   ├── TaskToast.jsx           # Success/error notifications
│   │   ├── TaskWorkspace.jsx       # Day/week task list and filters
│   │   └── WeekOverview.jsx        # Weekly calendar, counters and progress
│   │   ├── WorkspaceHeader.jsx     # Workspace switcher and team management
│   ├── context/
│   │   ├── AuthContext.jsx         # Session hydration and auth actions
│   │   ├── GuestSandboxContext.jsx # Local-only sample tasks and demo actions
│   │   ├── guestSandboxStorage.js  # Guest task persistence keys
│   │   └── WorkspaceContext.jsx    # Active workspace and member role
│   ├── pages/
│   │   ├── LandingPage.jsx         # Public product landing and chime preview
│   │   └── GuestSandbox.jsx        # Shared planner UI with local-only data
│   ├── hooks/
│   │   ├── useCalendarNavigation.js # Selected day/week and calendar navigation
│   │   ├── useTaskBoard.js          # Active-week selection, filters and progress
│   │   ├── useTaskDialogs.js        # Search and task dialog state
│   │   ├── useUpcomingAlarms.js     # In-app alarm polling and audio/vibration
│   │   └── useTasks.js              # Fetching, optimistic mutations and counts
│   ├── utils/
│   │   └── dateUtils.js             # Monday/week/date/time utilities
│   ├── App.jsx                      # App state composition and onboarding
│   ├── index.css                    # Tailwind import and global base styles
│   └── main.jsx                     # React application entry point
├── .env                             # Local Vite environment (ignored by Git)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json                     # Frontend dependencies and scripts
├── package-lock.json
├── vercel.json                      # SPA fallback rewrite
└── vite.config.js                   # React and Tailwind Vite plugins
```

### Database schema and task data

There is no Mongoose model or database schema in this repository. The following is the **task shape used by the frontend**, inferred from form payloads and rendered API records; it is not a verified database schema, and required flags/defaults at the database layer are unknown.

| Field         | Frontend-expected type   | Values / notes                                                                 |
| ------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `_id`         | string                   | API task identifier                                                            |
| `title`       | string                   | Required by the frontend form; trimmed; maximum 150 characters                 |
| `description` | string                   | Optional in the UI; trimmed; maximum 1,000 characters                          |
| `dateTime`    | ISO-8601 datetime string | API field; form serializes local date/time as UTC before submission             |
| `scheduledAt` | ISO-8601 datetime string | Frontend alias used for calendar display and week filtering                     |
| `priority`    | string                   | `Low`, `Medium`, or `High`; defaults to `Medium` for new tasks                 |
| `status`      | string                   | `In Progress` or `Completed`; a new task is treated as `In Progress` in the UI |
| `reminderConfig` | object                 | Optional `{ enabled, channels }`; channels are `EMAIL`, `WHATSAPP`, or `MOBILE_ALARM` |
| `reminderSentAt` | ISO datetime string    | When present, the task card displays the sent confirmation                       |

The weekly-summary endpoint returns items with `weekStart` (date/datetime string), `totalTasksCount` (number), `completedTasksCount` (number), `openTasksCount` (number), and `tasks` (array of the task shape above). The route accepts `timezone` (and `timezoneOffset`) for week grouping.

### Weekly grouping & date calculation

`src/utils/dateUtils.js` exports `getMondayOfWeek`, `getWeekDays`, and `parseLocalWeekStart`. `getMondayOfWeek` calculates Monday 00:00 in local time, including when the supplied date is Sunday; `getWeekDays` adds six local calendar days. `useCalendarNavigation.js` maintains the selected date and week, and `useTaskBoard.js` selects that week's server summary and filters its tasks. In `useTasks.js`, optimistic create/update operations group tasks into the week matching `scheduledAt`; toggling status adjusts the open/completed counters, and deleting adjusts total and status counts. The weekly summary is then refreshed from the API after successful mutations.

## API Documentation

The API base URL is `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`. Task and workspace routes use this base; auth routes use `/api/auth`. Requests use JSON and successful endpoints wrap their result in `data`. Task API cache responses are logged as `X-Cache: HIT|MISS` in development.

| Method   | Endpoint                | Description                                         | Request body / query                                                   | Success response expected by client                                                                                                                                                            | Status codes                                                                                          |
| -------- | ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET`    | `/tasks/weekly-summary` | Fetch weekly task groups and counters.              | Query: `timezone` (browser IANA timezone).                              | `{ "data": [ { "weekStart": "2026-11-09T00:00:00", "totalTasksCount": 1, "completedTasksCount": 0, "openTasksCount": 1, "tasks": [] } ] }`                                                     | `200`; `4xx` for invalid query or access and `5xx` for server errors.                                 |
| `GET`    | `/tasks`                | Search tasks. Search is debounced in the UI.        | Query: `search` (keyword string).                                      | `{ "data": [ { "_id": "task-id", "title": "Plan the week", "description": "Review priorities", "dateTime": "2026-11-09T09:00:00.000Z", "priority": "Medium", "status": "In Progress" } ] }` | Expected `200`; likely `4xx`/`5xx` on errors.                                                         |
| `POST`   | `/tasks`                | Create a task.                                      | JSON body shown below.                                                 | `{ "data": { "_id": "task-id", "title": "Plan the week", "description": "Review priorities", "dateTime": "2026-11-09T09:00:00.000Z", "priority": "Medium", "status": "In Progress" } }`      | Expected `201` (or `200`); likely `400` for invalid input and `5xx` for server errors.                |
| `PUT`    | `/tasks/:id`            | Update task fields.                                  | JSON task fields; `:id` is the task ID.                                 | `{ "data": { "_id": "task-id", "title": "Plan the week", "dateTime": "2026-11-09T09:00:00.000Z", "priority": "High", "status": "In Progress" } }`                                         | `200`; `400` invalid input, `404` missing task, `403` forbidden, or `5xx`.                            |
| `PATCH`  | `/tasks/:id/status`     | Change a task's status.                              | `{ "status": "Completed" }` or `{ "status": "In Progress" }`.          | Successful status response.                                                                                                                                                                     | `200`; `400` invalid status, `404` missing task, `403` forbidden, or `5xx`.                           |
| `DELETE` | `/tasks/:id`            | Delete a task.                                      | No body; `:id` is the task ID.                                         | The frontend does not consume the response body.                                                                                                                                               | Expected `200` or `204`; likely `404` for missing task and `5xx` for server errors.                   |

### Auth and workspace endpoints

| Method | Endpoint | Contract |
| --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password }`; returns `{ data: { accessToken, user: { id, name, email, defaultWorkspaceId } } }` and sets a refresh cookie. Registration creates `"<Name>'s Workspace"` with the new user as `OWNER`. |
| `POST` | `/api/auth/login` | `{ email, password }`; returns the same session shape and sets the refresh cookie. Login is rate limited. |
| `POST` | `/api/auth/refresh` | Uses the HttpOnly refresh cookie and returns a rotated access token/session shape. |
| `POST` | `/api/auth/logout` | Clears/revokes the refresh cookie. |
| `GET` | `/api/workspaces` | Returns the user's workspaces; each workspace includes `members: [{ userId, role, joinedAt }]`. |
| `POST` | `/api/workspaces` | `{ name }`; creates a workspace and makes the requester its `OWNER`. |
| `POST` | `/api/workspaces/:id/members` | `{ email, role }`; `OWNER` or `ADMIN` can add an existing user with role `ADMIN`, `MEMBER`, or `VIEWER`. |
| `PATCH` | `/api/workspaces/:id/members/:userId` | `{ role }`; only `OWNER` can change a member role (`ADMIN`, `MEMBER`, or `VIEWER`). |

Protected API requests use `Authorization: Bearer <accessToken>` and `x-workspace-id`. Backend workspace authorization returns `403` when the selected user is not a member or the role cannot perform the operation.

### Notification and alarm endpoints

| Method | Endpoint | Frontend behavior |
| --- | --- | --- |
| `PATCH` | `/api/auth/notifications` | Saves `phoneNumber` and `notificationPreferences` (`email`, `whatsapp`, `mobileAlarm`, `leadTimeMinutes`). |
| `GET` | `/api/tasks/upcoming-alarms` | Polled every 60 seconds when the signed-in user has mobile alarms enabled. |
| `GET` | `/api/tasks/:id/alarm.ics` | Authenticated per-task calendar event download. |
| `GET` | `/api/calendar/feed/:userId.ics` | Calendar subscription URL; requires authentication, which external calendar clients cannot provide without a backend-issued feed token. |

Example create/update body:

```json
{
  "title": "Plan the week",
  "description": "Review priorities",
  "dateTime": "2026-11-09T09:00:00.000Z",
  "priority": "Medium"
}
```

Example status update:

```json
{
  "status": "Completed"
}
```

## Local Setup & Installation

### Prerequisites

- Node.js and npm compatible with the Vite version in `package.json`.
- A running backend that implements the task API above. The backend cannot be installed or started from this frontend-only repository.

### Install and run the frontend

```bash
git clone https://github.com/nirmal4938/todo-react-frontend.git
cd todo-react-frontend
npm install
```

Create or update a root `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_API_BASE_URL` should be the backend API base (normally `http://localhost:5000/api`). Do not put credentials or secrets in a `VITE_` variable: Vite exposes these values in the browser bundle. `.env` is ignored by Git.

Run the frontend development server:

```bash
npm run dev
```

Start the backend separately using its own repository's documented setup and set `VITE_API_BASE_URL` to its `/api` base URL. Restart Vite after changing `.env`.

### Available scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start the Vite development server       |
| `npm run build`   | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production build locally    |
| `npm run lint`    | Run ESLint                              |

The Vercel rewrite in `vercel.json` sends unmatched paths to `index.html` for SPA routing. For another static host, configure an equivalent SPA fallback and set `VITE_API_BASE_URL` in the host's build environment.
For Vercel production, set `VITE_API_BASE_URL=/api` so API traffic uses the same-origin rewrite to the Render backend.

## Testing, Quality Assurance & End-User Proof

There is no test script or automated test suite in the current frontend `package.json`. Run the available quality checks with:

```bash
npm run lint
npm run build
```

### Manual QA test matrix

|   # | Scenario                          | Steps                                                                          | Expected result                                                                                                                  |
| --: | --------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Required title missing            | Open the task form, clear the title, and submit.                               | Form does not send a request; “Task title is required.” is shown and the field is marked invalid.                                |
|   2 | Whitespace-only title             | Enter spaces only and submit.                                                  | Trimmed title is rejected with the same required-title validation.                                                               |
|   3 | Missing date                      | Clear the date control and submit.                                             | Form does not send a request; “Choose a task date.” is shown.                                                                    |
|   4 | Missing time                      | Clear the time control and submit.                                             | Form does not send a request; “Choose a start time.” is shown.                                                                   |
|   5 | Successful create                 | Create a task with title, date, time, priority, and description.               | Task appears in its scheduled week/day; total and open counts reflect it, and success feedback appears.                          |
|   6 | Week boundary / Sunday            | Add tasks on Sunday and on the next Monday; navigate between their weeks.      | Sunday remains in the Monday-starting week that contains it; Monday begins the following week.                                   |
|   7 | Status toggle and weekly counters | Toggle an open task to completed and back.                                     | Completed/open cards and progress update immediately; the task list status filter reflects the selected state.                   |
|   8 | Mutation failure rollback         | Make the API reject a create, status update, or delete request.                | Optimistic UI changes are reverted and an error message/toast is shown.                                                          |
|   9 | Empty search                      | Search for a keyword with no matching tasks; also try a blank query.           | Search results reflect the backend response; the no-results message is shown when the returned list is empty.                    |
|  10 | Search request behavior           | Type several characters quickly, then close Search while a request is pending. | Requests are debounced; superseded/in-flight work is canceled; closing the overlay restores focus to its opener.                 |
|  11 | Swipe-to-delete on mobile         | On a touch device or emulator, swipe a task row left and choose Delete.        | Delete action is revealed; user can cancel or confirm; confirmed deletion updates the list/counts, with rollback on API failure. |
|  12 | Priority and day/week filters     | Select a priority, a day, and then View all; clear any status filter.          | Only tasks matching the current filters are displayed; week navigation and day selection remain usable.                          |

### Screenshots & Walkthrough

Replace the example paths below with committed screenshots/GIFs, or change them to hosted image URLs:

#### Mobile weekly overview

![Mobile weekly overview screenshot](docs/screenshots/mobile-week-overview.png)

#### Mobile task list and task form

![Mobile task list screenshot](docs/screenshots/mobile-task-list.png)

![Create or edit task form screenshot](docs/screenshots/task-form.png)

#### Search and swipe-to-delete

![Task search screenshot](docs/screenshots/task-search.png)

![Swipe-to-delete walkthrough](docs/walkthrough.gif)

## Architecture Notes

- `App.jsx` composes task data, calendar navigation, board filters, dialogs, and first-visit onboarding.
- `useTasks.js` owns API-driven task state, optimistic mutation/rollback, summary counts, and notifications.
- `taskApi.js` sets a 35-second request timeout and retries transient GET failures up to two times; mutations are not retried.
- Search results come from `GET /tasks?search=...`; matching title/description fields is a backend responsibility not present in this repository.
- Onboarding completion is stored in browser `localStorage` under `todo_onboarded`.
