import type { Task } from '../types/task'

const now = new Date()
const daysFromNow = (days: number) => {
    const copy = new Date(now)
    copy.setDate(copy.getDate() + days)
    return copy.toISOString()
}

const patients = [
    { id: 'p-01', name: 'Jordan Carter', age: 62, room: 'A-101' },
    { id: 'p-02', name: 'Emilia Stone', age: 54, room: 'A-102' },
    { id: 'p-03', name: 'Aiden Patel', age: 47, room: 'A-103' },
    { id: 'p-04', name: 'Maya Chen', age: 59, room: 'A-104' },
    { id: 'p-05', name: 'Liam Brooks', age: 66, room: 'A-105' },
    { id: 'p-06', name: 'Noah Kim', age: 51, room: 'A-106' },
    { id: 'p-07', name: 'Sophia Reyes', age: 44, room: 'A-107' },
    { id: 'p-08', name: 'Olivia Parker', age: 71, room: 'A-108' },
    { id: 'p-09', name: 'Elena Rossi', age: 57, room: 'A-109' },
    { id: 'p-10', name: 'Harper Lewis', age: 63, room: 'A-110' },
    { id: 'p-11', name: 'Caleb Morris', age: 49, room: 'B-201' },
    { id: 'p-12', name: 'Isla Turner', age: 52, room: 'B-202' },
    { id: 'p-13', name: 'Riley Adams', age: 58, room: 'B-203' },
    { id: 'p-14', name: 'Lucas Bennett', age: 67, room: 'B-204' },
    { id: 'p-15', name: 'Eva Martinez', age: 46, room: 'B-205' },
    { id: 'p-16', name: 'Zoe Nguyen', age: 60, room: 'B-206' },
    { id: 'p-17', name: 'Miles Foster', age: 55, room: 'B-207' },
    { id: 'p-18', name: 'Aria Scott', age: 50, room: 'B-208' },
    { id: 'p-19', name: 'Leo Carter', age: 64, room: 'B-209' },
    { id: 'p-20', name: 'Ella Davis', age: 53, room: 'B-210' },
    { id: 'p-21', name: 'Chloe Murphy', age: 45, room: 'C-301' },
    { id: 'p-22', name: 'Henry Walsh', age: 69, room: 'C-302' },
    { id: 'p-23', name: 'Ava Singh', age: 62, room: 'C-303' },
    { id: 'p-24', name: 'Nora Patel', age: 57, room: 'C-304' },
    { id: 'p-25', name: 'Wyatt Brooks', age: 48, room: 'C-305' },
    { id: 'p-26', name: 'Hazel Price', age: 56, room: 'C-306' },
    { id: 'p-27', name: 'Ethan Clark', age: 65, room: 'C-307' },
    { id: 'p-28', name: 'Lila Torres', age: 59, room: 'C-308' },
    { id: 'p-29', name: 'Owen Hughes', age: 61, room: 'C-309' },
    { id: 'p-30', name: 'Ruby Allen', age: 47, room: 'C-310' },
    { id: 'p-31', name: 'Stella Ward', age: 52, room: 'D-401' },
    { id: 'p-32', name: 'Jack Rivera', age: 68, room: 'D-402' },
    { id: 'p-33', name: 'Violet Perez', age: 55, room: 'D-403' },
    { id: 'p-34', name: 'Mila Green', age: 43, room: 'D-404' },
    { id: 'p-35', name: 'James Carter', age: 70, room: 'D-405' },
    { id: 'p-36', name: 'Naomi Sanders', age: 51, room: 'D-406' },
    { id: 'p-37', name: 'Ivy Cooper', age: 66, room: 'D-407' },
    { id: 'p-38', name: 'Eli Ward', age: 58, room: 'D-408' },
    { id: 'p-39', name: 'Layla Flores', age: 54, room: 'D-409' },
    { id: 'p-40', name: 'Gavin James', age: 50, room: 'D-410' },
    { id: 'p-41', name: 'Clara Ruiz', age: 63, room: 'E-501' },
    { id: 'p-42', name: 'Asher Boyd', age: 49, room: 'E-502' },
    { id: 'p-43', name: 'Audrey King', age: 60, room: 'E-503' },
    { id: 'p-44', name: 'Cole Reed', age: 46, room: 'E-504' },
    { id: 'p-45', name: 'Mason Ortiz', age: 67, room: 'E-505' },
    { id: 'p-46', name: 'Piper Kelly', age: 53, room: 'E-506' },
    { id: 'p-47', name: 'Julian Fox', age: 62, room: 'E-507' },
    { id: 'p-48', name: 'Sadie Bishop', age: 57, room: 'E-508' },
    { id: 'p-49', name: 'Dylan Shaw', age: 48, room: 'E-509' },
    { id: 'p-50', name: 'Quinn Baker', age: 55, room: 'E-510' },
]

const titles = ['Monthly labs', 'Access check', 'Diet counselling', 'Vaccination reminder', 'Social work follow-up']
const roles: Task['role'][] = ['nurse', 'dietician', 'social_worker']
const statuses: Task['status'][] = ['pending', 'in_progress', 'completed']

const initialTasks: Task[] = patients.map((patient, index) => {
    const title = titles[index % titles.length]
    const role = roles[index % roles.length]
    const status = statuses[index % statuses.length]
    const dueOffset = (index % 15) - 7 // spread across overdue/today/upcoming
    return {
        id: `t-${index + 1}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientRoom: patient.room,
        title,
        role,
        status,
        dueDate: daysFromNow(dueOffset),
        updatedAt: now.toISOString(),
    }
})

export let tasks: Task[] = initialTasks.map((task) => ({ ...task }))

export function resetTasks() {
    tasks = initialTasks.map((task) => ({ ...task }))
}
