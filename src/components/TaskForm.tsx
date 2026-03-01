import { type FormEvent, useState } from 'react'
import type { NewTaskPayload, Role } from '../types/task'
import { roleLabels, roles } from '../types/task'

interface TaskFormProps {
    onSubmit: (payload: NewTaskPayload) => void
    isSubmitting?: boolean
}

const today = new Date().toISOString().slice(0, 10)

function slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `p-${Date.now()}`
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
    const [patientName, setPatientName] = useState('')
    const [patientId, setPatientId] = useState('')
    const [patientAge, setPatientAge] = useState('')
    const [patientRoom, setPatientRoom] = useState('')
    const [title, setTitle] = useState('')
    const [role, setRole] = useState<Role>('nurse')
    const [dueDate, setDueDate] = useState(today)
    const [notes, setNotes] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        if (!patientName.trim() || !title.trim() || !dueDate) {
            setError('Patient, task, and due date are required')
            return
        }
        const ageValue = patientAge.trim()
        const parsedAge = ageValue ? Number(ageValue) : undefined
        if (ageValue && Number.isNaN(parsedAge)) {
            setError('Age must be a number')
            return
        }
        setError(null)
        onSubmit({
            patientName: patientName.trim(),
            patientId: patientId.trim() || slugify(patientName),
            patientAge: parsedAge,
            patientRoom: patientRoom.trim() || undefined,
            title: title.trim(),
            role,
            dueDate,
            notes: notes.trim() || undefined,
        })
        setTitle('')
        setNotes('')
        setPatientAge('')
        setPatientRoom('')
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label htmlFor="patient-name">Patient</label>
                <input
                    id="patient-name"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="e.g. Taylor Brooks"
                />
            </div>

            <div className="form-row">
                <label htmlFor="patient-id">Patient ID</label>
                <input
                    id="patient-id"
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                    placeholder="auto-generated if blank"
                />
            </div>

            <div className="form-grid">
                <div className="form-row">
                    <label htmlFor="patient-age">Age</label>
                    <input
                        id="patient-age"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={patientAge}
                        onChange={(event) => setPatientAge(event.target.value)}
                        placeholder="e.g. 62"
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="patient-room">Room</label>
                    <input
                        id="patient-room"
                        value={patientRoom}
                        onChange={(event) => setPatientRoom(event.target.value)}
                        placeholder="e.g. A-210"
                    />
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="task-title">Task</label>
                <input
                    id="task-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Monthly labs"
                />
            </div>

            <div className="form-grid">
                <div className="form-row">
                    <label htmlFor="role">Role</label>
                    <select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
                        {roles.map((roleValue) => (
                            <option key={roleValue} value={roleValue}>
                                {roleLabels[roleValue]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label htmlFor="due-date">Due date</label>
                    <input
                        id="due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                    />
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional context"
                    rows={2}
                />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Create task'}
            </button>
        </form>
    )
}
