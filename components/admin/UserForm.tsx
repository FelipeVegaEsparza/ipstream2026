'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  clientName: z.string().min(1, 'El nombre del proyecto es requerido'),
})

type UserInput = z.infer<typeof userSchema>

interface UserFormProps {
  initialData?: {
    id: string
    name?: string | null
    email: string
    client?: {
      id: string
      name: string
      plan: string
    } | null
  } | null
}

export function UserForm({ initialData }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      clientName: initialData?.client?.name || '',
    },
  })

  const onSubmit = async (data: UserInput) => {
    setLoading(true)
    try {
      const url = initialData 
        ? `/api/admin/users/${initialData.id}` 
        : '/api/admin/users'
      
      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/admin/users')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar el usuario')
      }
    } catch (error) {
      alert('Error al guardar el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            className="form-input"
            placeholder="Ej: Juan Pérez"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="juan@ejemplo.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Contraseña {initialData ? '(dejar vacío para mantener actual)' : '*'}
        </label>
        <input
          type="password"
          id="password"
          className="form-input"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Información del Proyecto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="clientName" className="form-label">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="clientName"
              className="form-input"
              placeholder="Ej: Radio Ejemplo FM"
              {...register('clientName')}
            />
            {errors.clientName && (
              <p className="text-sm text-red-400">{errors.clientName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Plan
            </label>
            <div className="form-input bg-gray-700 text-gray-400 cursor-not-allowed">
              Se asignará después de crear el usuario
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Los planes se gestionan desde el módulo de facturación
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Información importante
            </h4>
            <p className="text-sm text-blue-200/80">
              {initialData 
                ? 'Al actualizar este usuario, los cambios se aplicarán inmediatamente. Si cambias la contraseña, el usuario deberá usar la nueva para iniciar sesión.'
                : 'Se creará automáticamente una cuenta de cliente asociada al usuario. El usuario podrá iniciar sesión inmediatamente con las credenciales proporcionadas.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Guardando...' : (initialData ? 'Actualizar Usuario' : 'Crear Usuario')}
        </button>
      </div>
    </form>
  )
}