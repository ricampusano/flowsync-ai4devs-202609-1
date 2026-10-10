import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AlertCircleIcon, CalendarX2Icon } from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import type { Task } from '@/lib/types'
import { useAuth } from '@/auth/use-auth'
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

const COMPLETE_DATE = /^\d{4,6}-\d{2}-\d{2}$/

export function TaskPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | undefined>()
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !id) return
    let cancelled = false

    api
      .getTask(token, Number(id))
      .then((loaded) => {
        if (cancelled) return
        setTask(loaded)
        setDueDate(loaded.dueDate ?? '')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError && error.status !== 404
            ? error.message
            : 'No hemos encontrado esa tarea.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token, id])

  const save = async (next: string | null) => {
    if (!token || !task) return
    setDateError(undefined)
    setActionError(null)

    try {
      const updated = await api.updateTaskDueDate(token, task.id, next)
      setTask(updated)
      setDueDate(updated.dueDate ?? '')
    } catch (error) {
      // La fecha guardada se mantiene y se vuelve a mostrar en el campo.
      setDueDate(task.dueDate ?? '')
      if (error instanceof ApiError && error.fieldErrors.dueDate) {
        setDateError(error.fieldErrors.dueDate)
      } else {
        setActionError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido guardar la fecha.',
        )
      }
    }
  }

  const handleChange = (value: string) => {
    setDueDate(value)
    // Un valor incompleto (campo a medio rellenar) no se envía.
    if (COMPLETE_DATE.test(value) && value !== task?.dueDate) void save(value)
  }

  if (!task && !loadError) return <FullScreenLoader />

  const alertMessage = loadError ?? actionError

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks">Volver a las tareas</Link>
        </Button>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {task && (
          <Card>
            <CardHeader>
              <CardTitle className="break-words">{task.title}</CardTitle>
              <CardDescription>
                {task.assignee.fullName ?? 'Sin nombre'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                <div className="flex gap-2">
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(event) => handleChange(event.target.value)}
                    aria-invalid={Boolean(dateError)}
                    aria-describedby={dateError ? 'dueDate-error' : undefined}
                  />
                  {task.dueDate && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void save(null)}
                    >
                      Quitar fecha
                    </Button>
                  )}
                </div>
                <FieldError id="dueDate-error" message={dateError} />
              </div>

              {task.isOverdue && (
                <Alert variant="destructive">
                  <CalendarX2Icon />
                  <AlertDescription>
                    Vencida: la fecha de vencimiento ya pasó.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
