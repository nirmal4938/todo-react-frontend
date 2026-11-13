# Weekly Task Planner — To-Do App

A responsive weekly planner for creating, organizing, and completing tasks. The frontend is a React single-page application backed by an Express 5 API and MongoDB.

## Features

- View tasks by day or across the current week.
- Browse weeks and track weekly completed/pending totals and progress.
- Filter tasks by status and priority.
- Create, edit, search, complete, and delete tasks.
- Optimistic task updates with rollback and clear action feedback.
- Mobile-friendly task controls, swipe-to-reveal delete, and confirmation before deletion.
- Search cancellation, retry handling, and loading feedback for slow API cold starts.

## Technology

- React 19
- Vite
- Tailwind CSS 4
- Axios
- Lucide React icons
- Backend: Express 5 and MongoDB

## Local setup

Prerequisites: Node.js and npm, plus a running compatible backend API.

1. Install frontend dependencies:

   ```sh
   npm install
   ```

2. Set the API base URL in a root `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

   The URL should be the API base path; the frontend appends `/tasks` for task requests. If this variable is omitted, the frontend defaults to `http://localhost:5000/api/v1`.

3. Start the development server:

   ```sh
   npm run dev
   ```

   Vite prints the local URL in the terminal.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint |

## Deployment

Build the frontend with `npm run build` and deploy the generated `dist/` directory to a static hosting provider. Configure `VITE_API_BASE_URL` in the hosting provider's build environment to the deployed backend API base URL, then rebuild and redeploy; Vite environment variables are embedded at build time.

The included `vercel.json` rewrite supports client-side routes by serving `index.html` for paths that do not match a static asset. For other static hosts, configure an equivalent single-page application fallback.

The frontend expects the backend to expose the task API under `/tasks`, including weekly summary, search, create, update, status update, and delete endpoints. The deployed backend must allow browser requests from the frontend origin. Free-tier hosting may put the API to sleep; the UI has a 35-second request timeout, bounded retries for GET requests, and a cold-start loading message.
