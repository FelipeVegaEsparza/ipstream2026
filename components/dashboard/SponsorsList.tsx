'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PencilIcon, TrashIcon, EyeIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface Sponsor {
  id: string
  name: string
  logoUrl?: string | null
  address?: string | null
  description: string
  facebook?: string | null
  youtube?: string | null
  instagram?: string | null
  tiktok?: string | null
  whatsapp?: string | null
  x?: string | null
  website?: string | null
  createdAt: Date
}

interface SponsorsListProps {
  sponsors: Sponsor[]
}

export function SponsorsList({ sponsors }: SponsorsListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este auspiciador?')) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/sponsors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al eliminar el auspiciador')
      }
    } catch (error) {
      alert('Error al eliminar el auspiciador')
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const getSocialNetworks = (sponsor: Sponsor) => {
    const networks = []
    if (sponsor.facebook) networks.push({ name: 'Facebook', url: sponsor.facebook, color: 'text-blue-600' })
    if (sponsor.instagram) networks.push({ name: 'Instagram', url: sponsor.instagram, color: 'text-pink-600' })
    if (sponsor.youtube) networks.push({ name: 'YouTube', url: sponsor.youtube, color: 'text-red-600' })
    if (sponsor.tiktok) networks.push({ name: 'TikTok', url: sponsor.tiktok, color: 'text-gray-800' })
    if (sponsor.x) networks.push({ name: 'X', url: sponsor.x, color: 'text-gray-800' })
    if (sponsor.website) networks.push({ name: 'Website', url: sponsor.website, color: 'text-green-600' })
    return networks
  }

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay auspiciadores
        </h3>
        <p className="text-gray-600 mb-4">
          Comienza agregando tu primer auspiciador
        </p>
        <Link href="/dashboard/sponsors/new" className="btn-primary">
          Agregar Auspiciador
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sponsors.map((sponsor) => {
        const socialNetworks = getSocialNetworks(sponsor)
        
        return (
          <div key={sponsor.id} className="card">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              {sponsor.logoUrl ? (
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  width={120}
                  height={80}
                  className="h-20 w-auto object-contain"
                />
              ) : (
                <div className="h-20 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sin logo</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {sponsor.name}
                </h3>
                {sponsor.address && (
                  <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {sponsor.address}
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3 text-center">
                {sponsor.description}
              </p>

              {/* Social Networks */}
              {socialNetworks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {socialNetworks.slice(0, 4).map((network) => (
                    <a
                      key={network.name}
                      href={network.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 ${network.color}`}
                      title={network.name}
                    >
                      {network.name}
                    </a>
                  ))}
                  {socialNetworks.length > 4 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      +{socialNetworks.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Website */}
              {sponsor.website && (
                <div className="text-center">
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-1" />
                    Sitio Web
                  </a>
                </div>
              )}

              <div className="text-center text-xs text-gray-500">
                Agregado: {formatDate(sponsor.createdAt)}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center space-x-2 pt-3 border-t">
                <Link
                  href={`/dashboard/sponsors/${sponsor.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title="Ver auspiciador"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                <Link
                  href={`/dashboard/sponsors/${sponsor.id}/edit`}
                  className="p-2 text-gray-400 hover:text-primary-600"
                  title="Editar auspiciador"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(sponsor.id)}
                  disabled={loading === sponsor.id}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Eliminar auspiciador"
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