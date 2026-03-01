import { useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { TaskBoard } from './components/TaskBoard'
import { TaskForm } from './components/TaskForm'
import {
  useCreateTaskMutation,
  useFilteredTasks,
  useUpdateTaskStatusMutation,
} from './hooks/useTasks'
import { computeTimeBucket, roleLabels, statusLabels, taskStatuses, type Role, type TaskStatus } from './types/task'

type ActivityItem = {
  id: string
  patientName: string
  role: Role
  status: string
  when: string
  title: string
}

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isManage = location.pathname === '/manage'

  const { tasks, isLoading, isError, refetch } = useFilteredTasks()
  const createTask = useCreateTaskMutation()
  const updateTask = useUpdateTaskStatusMutation()
  const [banner, setBanner] = useState<string | null>(null)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  const statusCounts = useMemo(
    () =>
      taskStatuses.reduce<Record<TaskStatus, number>>((acc, status) => {
        acc[status] = tasks.filter((task) => task.status === status).length
        return acc
      }, {} as Record<TaskStatus, number>),
    [tasks],
  )

  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (task) => task.status !== 'completed' && computeTimeBucket(task.dueDate) === 'overdue',
      ).length,
    [tasks],
  )

  const patientCount = useMemo(() => new Set(tasks.map((task) => task.patientId)).size, [tasks])

  const roleBadge: Record<Role, string> = {
    nurse: 'RN',
    dietician: 'DT',
    social_worker: 'SW',
  }

  const activityFeed: ActivityItem[] = useMemo(() => {
    const sorted = [...tasks]
      .filter((task) => task.updatedAt)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 8)
    return sorted.map((task) => ({
      id: task.id,
      patientName: task.patientName,
      role: task.role,
      status: statusLabels[task.status],
      when: task.updatedAt || task.dueDate,
      title: task.title,
    }))
  }, [tasks])

  const total = tasks.length || 1
  const progressByStatus = {
    pending: Math.round(((statusCounts.pending || 0) / total) * 100),
    in_progress: Math.round(((statusCounts.in_progress || 0) / total) * 100),
    completed: Math.round(((statusCounts.completed || 0) / total) * 100),
    overdue: Math.min(100, Math.round((overdueCount / total) * 100)),
  }

  const markBusy = (taskId: string) =>
    setBusyIds((current) => {
      const next = new Set(current)
      next.add(taskId)
      return next
    })

  const clearBusy = (taskId: string) =>
    setBusyIds((current) => {
      const next = new Set(current)
      next.delete(taskId)
      return next
    })

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setBanner(null)
    markBusy(taskId)
    updateTask.mutate(
      { taskId, status },
      {
        onError: (error) => setBanner(error.message || 'Failed to update task'),
        onSettled: () => clearBusy(taskId),
      },
    )
  }

  const handleCreateTask = (payload: Parameters<typeof createTask.mutate>[0]) => {
    setBanner(null)
    createTask.mutate(payload, {
      onError: (error) => setBanner(error.message || 'Failed to create task'),
    })
  }

  return (
    <>
      {isHome && (
        <div className="background-media" aria-hidden>
          <video
            className="background-video"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/media/bg-dialysis.mp4" type="video/mp4" />
          </video>
          <div className="background-overlay" />
        </div>
      )}

      <div className="app-shell">
        <div className="topbar">
          <div className="brand">
            <img className="brand-logo" src="/media/jano-logo.png" alt="Jano Health" />
            <div>
              <div className="brand-title">Jano Health</div>
              <div className="brand-sub">Clinical Ops Command</div>
            </div>
          </div>
          <div className="top-actions">
            <span className="chip chip-online">Live ops</span>
            <span className="chip chip-secure">Rounds in progress</span>
            <span className="chip chip-muted">Secure channel</span>
            <Link className={`chip nav-chip${isHome ? ' nav-chip--active' : ''}`} to="/">Board</Link>
            <Link className={`chip nav-chip${isManage ? ' nav-chip--active' : ''}`} to="/manage">
              Manage
            </Link>
          </div>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                patientCount={patientCount}
                overdueCount={overdueCount}
                banner={banner}
                onDismissBanner={() => setBanner(null)}
                tasks={tasks}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                busyIds={busyIds}
                handleStatusChange={handleStatusChange}
                activityFeed={activityFeed}
                roleBadge={roleBadge}
                handleCreateTask={handleCreateTask}
                isCreating={createTask.isPending}
                manageLink="/manage"
              />
            }
          />
          <Route
            path="/manage"
            element={
              <ManagePage
                banner={banner}
                onDismissBanner={() => setBanner(null)}
                tasks={tasks}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                busyIds={busyIds}
                handleStatusChange={handleStatusChange}
              />
            }
          />
        </Routes>
      </div>
    </>
  )
}

type HomePageProps = {
  patientCount: number
  overdueCount: number
  banner: string | null
  onDismissBanner: () => void
  tasks: ReturnType<typeof useFilteredTasks>['tasks']
  isLoading: boolean
  isError: boolean
  refetch: () => void
  busyIds: Set<string>
  handleStatusChange: (taskId: string, status: TaskStatus) => void
  activityFeed: ActivityItem[]
  roleBadge: Record<Role, string>
  handleCreateTask: (payload: Parameters<ReturnType<typeof useCreateTaskMutation>['mutate']>[0]) => void
  isCreating: boolean
  manageLink: string
}

function HomePage({
  patientCount,
  overdueCount,
  banner,
  onDismissBanner,
  tasks,
  isLoading,
  isError,
  refetch,
  busyIds,
  handleStatusChange,
  activityFeed,
  roleBadge,
  handleCreateTask,
  isCreating,
  manageLink,
}: HomePageProps) {
  return (
    <>
      <section className="video-panel" aria-label="Dialysis care video">
        <div className="video-shell">
          <video
            className="hero-video"
            playsInline
            muted
            loop
            autoPlay
            preload="metadata"
            poster="/media/dialysis-care-poster.jpg"
          >
            <source src="/media/dialysis-care.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow console">Care Plan Taskboard</p>
          <h1>Dialysis care, coordinated for every round</h1>
          <p className="lead">
            Track access checks, monthly labs, diet and social work follow-ups with resilient, optimistic workflows.
            Built for charge nurses, dieticians, and social workers to keep rounds moving.
          </p>
          <div className="hero-badges floating">
            <span className="pill strong">{patientCount} active patients</span>
            <span className="pill amber">{overdueCount} overdue items</span>
            <span className="pill">Shift ready</span>
          </div>
          <div className="cta-row">
            <button type="button" className="primary-cta">Start shift brief</button>
            <span className="cta-glow" aria-hidden />
          </div>
        </div>
        <div className="hero-illustration">
          <div className="glass-card">
            <p className="eyebrow">Rounds dashboard</p>
            <h3>Live coverage</h3>
            <ul>
              <li>Consolidated patient stream</li>
              <li>Role-aware routing</li>
              <li>Optimistic updates + rollback</li>
            </ul>
          </div>
        </div>
      </div>

      <FilterBar />

      {banner && (
        <div className="banner" role="alert">
          <span>{banner}</span>
          <button type="button" className="ghost-button" onClick={onDismissBanner}>
            Dismiss
          </button>
        </div>
      )}

      <section className="dashboard-grid">
        <div className="left-column">
          <div className="board">
            <TaskBoard
              tasks={tasks}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              busyIds={busyIds}
              onStatusChange={handleStatusChange}
              readOnly
              manageLink={manageLink}
            />
          </div>

          <div className="activity-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Patient stream</p>
                <h3>Recent activity</h3>
              </div>
              <span className="chip chip-muted">Live</span>
            </div>
            <ul className="activity-list">
              {activityFeed.map((item) => (
                <li key={item.id} className="activity-item">
                  <div className="avatar" aria-hidden>{item.patientName.slice(0, 2)}</div>
                  <div className="activity-text">
                    <div className="activity-top">
                      <span className="patient-name">{item.patientName}</span>
                      <span className={`role role-${item.role}`}>{roleBadge[item.role]}</span>
                      <span className="time-ago">{formatTimeAgo(item.when)}</span>
                    </div>
                    <div className="activity-sub">
                      <span className="title">{item.title}</span>
                      <span className="status-pill">{item.status}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="right-column">
          <div className="sidebar glass">
            <div className="sidebar-header">
              <h2>Create task</h2>
              <p className="muted">Optimistic create with rollback on failure.</p>
            </div>
            <div className="info-panel">
              <p className="info-title">Dialysis checklist</p>
              <ul>
                <li>Document access checks and monthly labs</li>
                <li>Flag diet and social work interventions</li>
                <li>Track vaccination and infection prevention reminders</li>
              </ul>
            </div>
            <TaskForm onSubmit={handleCreateTask} isSubmitting={isCreating} />
          </div>
        </aside>
      </section>
    </>
  )
}

type ManagePageProps = {
  banner: string | null
  onDismissBanner: () => void
  tasks: ReturnType<typeof useFilteredTasks>['tasks']
  isLoading: boolean
  isError: boolean
  refetch: () => void
  busyIds: Set<string>
  handleStatusChange: (taskId: string, status: TaskStatus) => void
}

function ManagePage({ banner, onDismissBanner, tasks, isLoading, isError, refetch, busyIds, handleStatusChange }: ManagePageProps) {
  return (
    <section className="manage-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow console">Task actions</p>
          <h2>Manage tasks</h2>
        </div>
      </div>

      <FilterBar />

      {banner && (
        <div className="banner" role="alert">
          <span>{banner}</span>
          <button type="button" className="ghost-button" onClick={onDismissBanner}>
            Dismiss
          </button>
        </div>
      )}

      <div className="board manage-board">
        <TaskBoard
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          busyIds={busyIds}
          onStatusChange={handleStatusChange}
        />
      </div>
    </section>
  )
}

function formatTimeAgo(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = Math.max(0, now.getTime() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default App
