# Integration & Failure Modes

## API Contracts
- Base path: `/api` (mocked via MSW). Endpoints: `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`.
- Response contract: `Task` schema defined in `src/types/task.ts` (zod). Missing optional fields are defaulted; validation failures surface an error banner and stop rendering outdated data.
- Task creation: server returns the created `Task`; UI optimistically inserts a placeholder task while awaiting confirmation.
- Task status update: server returns the full task; UI optimistically updates status with rollback on failure.

## State and Data Flow
- **React Query** holds server state (`tasks`). Filters are local (Zustand) and applied client-side to avoid refetch churn for simple role/time filters.
- **Optimistic mutations:**
  - `createTask`: adds placeholder task to cache; rollback on error; invalidates query after settle.
  - `updateTaskStatus`: updates cache immediately; rollback on error; invalidates query after settle.
- **Grouping/render:** tasks filtered by role/time, grouped per patient, then rendered into status columns.

## Failure Handling
- **Network errors / non-2xx:** HTTP helper raises `HttpError`; React Query retries (2x for queries, 1x for mutations). UI shows banner + retry CTA; optimistic cache rolls back on mutation errors.
- **Slow endpoints:** MSW delay simulates latency. UI disables per-task buttons while mutation is in-flight.
- **Schema drift:** Zod `TaskSchema` and `TaskListSchema` guard responses; failures log to console and present an error banner rather than rendering partial/incorrect data.
- **Empty/filtered state:** Taskboard shows an explicit empty panel instead of blank space.

## Adapting to New Roles or Task Categories
- Add roles/statuses to `roles`/`taskStatuses` arrays and label maps in `src/types/task.ts`.
- Update MSW handlers (`src/mocks/handlers.ts`) and seed data (`src/mocks/data.ts`) to reflect new fields.
- UI reads roles/status lists dynamically; filters and board columns expand automatically. Add formatting for new fields in `TaskCard` as needed.

## Partial Failure Examples
- **PATCH 500:** UI flips status optimistically, rollback on error, shows banner; user can retry.
- **GET validation failure:** UI halts rendering and surfaces an error instead of showing corrupt data; retry after backend fix.
- **Network down:** Queries retry then fail; user can hit "Retry" control on the board.
