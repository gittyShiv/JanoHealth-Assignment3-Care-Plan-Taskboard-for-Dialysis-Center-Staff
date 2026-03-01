# Care Plan Taskboard (React + TypeScript)

Front-end taskboard for dialysis center staff with optimistic updates, filtering by role/time, and MSW-backed mocked APIs. Focus areas: explicit data contracts, resilient UI under imperfect data/network, and clear separation of concerns.

## Quickstart
- Install: `npm install`
- Dev server with mocks: `npm run dev`
- Tests: `npm test`
- Production build: `npm run build`

## Domain and Data Contracts
- Roles: `nurse | dietician | social_worker`
- Statuses: `pending | in_progress | completed`
- Time filter buckets (derived from `dueDate` for non-completed tasks): `overdue` (< today), `due-today` (same calendar day), `upcoming` (future/invalid dates).
- Task shape (API contract): `{ id, patientId, patientName, patientAge?, patientRoom?, title, role, status, dueDate, updatedAt?, notes? }` (strings except `patientAge`). Runtime validation via `zod`; missing `patientName` defaults to "Unknown patient".
- New task payload: `{ patientId, patientName, patientAge?, patientRoom?, title, role, dueDate, notes? }`; `patientId` auto-slugs from name if omitted in UI.

## Architecture
- **Server state:** React Query (`useTasksQuery`, `useCreateTaskMutation`, `useUpdateTaskStatusMutation`) with optimistic updates + rollbacks.
- **UI/local state:** Zustand store for filters (`role`, `time`).
- **API layer:** `src/api` with fetch wrapper and DTO parsing/validation.
- **Mocks:** MSW (`src/mocks`) simulating `/api/tasks` GET/POST/PATCH; used in dev and tests. Runtime begins in `src/main.tsx` for dev; Node server in tests.
- **Components:**
  - `TaskBoard` renders patients as rows, statuses as columns; cards show due bucket badges and action buttons.
  - `FilterBar` controls role/time filters.
  - `TaskForm` creates tasks with optimistic insert + rollback on failure.
- **Utilities:** `taskGrouping` for grouping/sorting tasks per patient; `computeTimeBucket` for time filters.

## Failure Modes & Resilience
- **Network errors:** React Query retries twice for fetch; error banners + retry controls. Mutations rollback cache on error, keeping UI consistent.
- **Unexpected payloads:** Zod validation guards API responses; invalid shapes raise user-facing error and stop rendering stale data.
- **Optimistic UI:** Pending updates are disabled per-task (`busyIds`); failures surface a banner and revert cache. Covered by test `optimisticUpdate.test.tsx`.
- **Mock drift:** MSW handlers kept alongside DTOs; update both when contracts change.

## Extending Roles / Task Types
- Add roles/statuses in `src/types/task.ts` and map labels; UI/filters read from those arrays.
- New task attributes: extend `TaskSchema` (zod) + type; display fields in `TaskCard` and MSW handlers.

## Tests
- State slice: `filterStore.test.ts` verifies filter defaults and actions.
- Component behavior: `optimisticUpdate.test.tsx` validates rollback when PATCH fails.

## Folder Map
- `src/types`: data contracts and helpers.
- `src/api`: HTTP wrapper + task API client.
- `src/hooks`: React Query hooks for tasks.
- `src/state`: Zustand filter store.
- `src/components`: UI pieces (board, cards, filters, form).
- `src/mocks`: MSW handlers/data for dev/tests.
- `src/utils`: grouping helpers.
- `src/test`: shared vitest setup.

See [docs/integration.md](docs/integration.md) for integration and failure-mode specifics.
