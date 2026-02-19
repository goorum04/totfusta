'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface TimeEntry {
  id: number
  date: string
  hours: number
  description: string
  status: string
  comment: string | null
  user: { name: string }
  project: { name: string }
}

export default function PendingHoursPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [commentModal, setCommentModal] = useState<{
    entry: TimeEntry
    action: 'approve' | 'reject'
  } | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetch('/api/hours/pending')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
  }, [])

  const handleAction = async (entryId: number, action: 'approve' | 'reject', commentText: string) => {
    const res = await fetch(`/api/hours/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        comment: commentText,
      }),
    })

    if (res.ok) {
      setEntries(entries.filter((e) => e.id !== entryId))
      setCommentModal(null)
      setComment('')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Cargando...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Horas Pendientes de Validación</h1>

        {entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay registros pendientes de validación
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg">{entry.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Proyecto:</strong> {entry.project.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Horas:</strong> {entry.hours}h
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Trabajo realizado:</strong>
                      <p className="mt-1 bg-gray-50 p-2 rounded">{entry.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCommentModal({ entry, action: 'approve' })}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => setCommentModal({ entry, action: 'reject' })}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {commentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {commentModal.action === 'approve' ? 'Aprobar' : 'Rechazar'} Registro
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  commentModal.action === 'approve'
                    ? 'Añadir un comentario...'
                    : 'Indica el motivo del rechazo...'
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setCommentModal(null)
                  setComment('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(commentModal.entry.id, commentModal.action, comment)}
                className={`px-4 py-2 text-white rounded-md ${
                  commentModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
