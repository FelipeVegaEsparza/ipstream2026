'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatTime, formatWeekDays } from '@/lib/utils'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Program {
  id: string
  name: string
  imageUrl?: string | null
  description: string
  startTime: string
  endTime: string
  weekDays: string
}

interface ProgramsListProps {
  programs: Program[]
}

export function ProgramsList({ programs }: ProgramsListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este programa?')) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al eliminar el programa')
      }
    } catch (error) {
      alert('Error al eliminar el programa')
    } finally {
      setLoading(null)
    }
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay programas
        </h3>
        <p className="text-gray-600 mb-4">
          Comienza agregando tu primer programa de radio
        </p>
        <Link href="/dashboard/programs/new" className="btn-primary">
          Crear Programa
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => {
        const weekDays = JSON.parse(program.weekDays)
        
        return (
          <div key={program.id} className="card">
            {program.imageUrl && (
              <div className="mb-4">
                <Image
                  src={program.imageUrl}
                  alt={program.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {program.name}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3">
                {program.description}
              </p>
              
              <div className="text-sm text-gray-500">
                <div>
                  <strong>Horario:</strong> {formatTime(program.startTime)} - {formatTime(program.endTime)}
                </div>
                <div>
                  <strong>Días:</strong> {formatWeekDays(weekDays)}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <Link
                  href={`/dashboard/programs/${program.id}/edit`}
                  className="p-2 text-gray-400 hover:text-primary-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(program.id)}
                  disabled={loading === program.id}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}