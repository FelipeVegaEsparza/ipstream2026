// TEMPORALMENTE SIMPLIFICADO - Se restaurará después del primer deploy exitoso
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}