import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import type { Task, TaskStatus } from '@/lib/types'
import { useAuth } from '@/auth/use-auth'
import { useAuthForm } from '@/auth/use-auth-form'
import { FieldError } from '@/components/field-error'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FIELDS = ['title'] as const

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'done', label: 'Hecho' },
]

export function TasksPage() {
  const { token } = useAuth()
  const { isSubmitting, formError, fieldErrors, submit, failWith } =
    useAuthForm(FIELDS)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [title, setTitle] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const titleInput = useRef<HTMLInputElement>(null)

  // Una sola lista compartida: se pide entera y se pinta tal y como llega.
  useEffect(() => {
    if (!token) return
    let cancelled = false

    api
      .getTasks(token)
      .then((list) => {
        if (!cancelled) setTasks(list)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido cargar las tareas.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    if (title.trim() === '') {
      failWith('title', 'Falta rellenar el título.')
      return
    }

    return submit(async () => {
      const created = await api.createTask(token, title)
      setTasks((current) => [...(current ?? []), created])
      setTitle('')
    })
  }

  const handleStatus = async (task: Task, status: TaskStatus) => {
    if (!token || task.status === status) return
    setActionError(null)

    try {
      const updated = await api.updateTaskStatus(token, task.id, status)
      setTasks((current) =>
        (current ?? []).map((item) =>
          item.id === updated.id ? updated : item,
        ),
      )
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'No hemos podido cambiar el estado.',
      )
    }
  }

  if (tasks === null && !loadError) return <FullScreenLoader />

  const alertMessage = loadError ?? formError ?? actionError

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Tareas</h1>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">Mi perfil</Link>
          </Button>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-2" noValidate>
              <Label htmlFor="title">Nueva tarea</Label>
              <div className="flex gap-2">
                <Input
                  id="title"
                  name="title"
                  ref={titleInput}
                  placeholder="¿En qué andas?"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={
                    fieldErrors.title ? 'title-error' : undefined
                  }
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando…' : 'Crear tarea'}
                </Button>
              </div>
              <FieldError id="title-error" message={fieldErrors.title} />
            </form>
          </CardContent>
        </Card>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {tasks !== null && tasks.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Todavía no hay tareas</CardTitle>
              <CardDescription>
                Esta es la lista compartida del equipo: aquí todos ven en qué
                anda cada uno y en qué estado está.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => titleInput.current?.focus()}>
                Crear la primera tarea
              </Button>
            </CardContent>
          </Card>
        )}

        {tasks !== null && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <Card>
                  <CardContent className="grid gap-3">
                    <div className="min-w-0">
                      <p className="font-medium break-words">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="hover:underline"
                        >
                          {task.title}
                        </Link>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {task.assignee.fullName ?? 'Sin nombre'}
                      </p>
                    </div>
                    <div
                      role="group"
                      aria-label={`Estado de ${task.title}`}
                      className="flex flex-wrap gap-2"
                    >
                      {STATUSES.map(({ value, label }) => (
                        <Button
                          key={value}
                          size="sm"
                          variant={
                            task.status === value ? 'default' : 'outline'
                          }
                          aria-pressed={task.status === value}
                          onClick={() => handleStatus(task, value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
