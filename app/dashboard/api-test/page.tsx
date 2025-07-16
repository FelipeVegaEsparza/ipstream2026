'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function ApiTestPage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="text-white">Cargando...</div>
  }

  if (!session?.user.clientId) {
    return <div className="text-white">Error: No se encontró información del cliente</div>
  }

  const clientId = session.user.clientId
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const endpoints = [
    {
      name: 'Toda la información',
      url: `/api/public/${clientId}`,
      description: 'Obtiene todos los datos del cliente'
    },
    {
      name: 'Datos básicos',
      url: `/api/public/${clientId}/basic-data`,
      description: 'Información básica del proyecto'
    },
    {
      name: 'Redes sociales',
      url: `/api/public/${clientId}/social-networks`,
      description: 'Enlaces a redes sociales'
    },
    {
      name: 'Programas',
      url: `/api/public/${clientId}/programs`,
      description: 'Lista de programas de radio'
    },
    {
      name: 'Noticias',
      url: `/api/public/${clientId}/news`,
      description: 'Lista de noticias'
    },
    {
      name: 'Videos',
      url: `/api/public/${clientId}/videos`,
      description: 'Ranking de videos'
    },
    {
      name: 'Auspiciadores',
      url: `/api/public/${clientId}/sponsors`,
      description: 'Lista de sponsors'
    },
    {
      name: 'Promociones',
      url: `/api/public/${clientId}/promotions`,
      description: 'Lista de promociones'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Prueba de API REST
        </h1>
        <p className="text-gray-400">
          Prueba todos los endpoints de tu API REST pública
        </p>
      </div>

      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Tu Client ID
        </h3>
        <code className="bg-gray-700/50 px-4 py-3 rounded-lg text-sm text-cyan-300 font-mono block border border-gray-600">
          {clientId}
        </code>
        <p className="text-xs text-gray-400 mt-2">
          Usa este ID para acceder a tu API REST pública
        </p>
      </div>

      <div className="grid gap-6">
        {endpoints.map((endpoint) => (
          <div key={endpoint.url} className="card hover:scale-[1.02] transition-transform duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {endpoint.name}
                </h3>
                <p className="text-gray-400">
                  {endpoint.description}
                </p>
              </div>
              <div className="flex space-x-3 ml-4">
                <a
                  href={endpoint.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${baseUrl}${endpoint.url}`)
                    // Opcional: mostrar notificación de copiado
                  }}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
              </div>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <code className="text-sm text-green-400 font-mono">
                GET {baseUrl}{endpoint.url}
              </code>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Ejemplo de uso con JavaScript
        </h3>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 overflow-x-auto">
          <pre className="text-green-400 text-sm leading-relaxed">
{`// Obtener toda la información del cliente
fetch('${baseUrl}/api/public/${clientId}')
  .then(response => response.json())
  .then(data => console.log(data))

// Obtener solo los programas
fetch('${baseUrl}/api/public/${clientId}/programs')
  .then(response => response.json())
  .then(programs => console.log(programs))

// Obtener ranking de videos
fetch('${baseUrl}/api/public/${clientId}/videos')
  .then(response => response.json())
  .then(videos => {
    console.log('Top 10 videos:', videos)
    // Los videos vienen ordenados por ranking (order ASC)
  })

// Obtener noticias con paginación
fetch('${baseUrl}/api/public/${clientId}/news?page=1&limit=5')
  .then(response => response.json())
  .then(data => {
    console.log('Noticias:', data.data)
    console.log('Paginación:', data.pagination)
  })`}
          </pre>
        </div>
      </div>
    </div>
  )
}