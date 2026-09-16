import prisma from '@/lib/prisma'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const asistentes = await prisma.asistente.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const config = await prisma.configuracion.findFirst({
    where: { clave: 'REGISTRO_PASSWORD' }
  })

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(15,23,42,0) 70%)', zIndex: -1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panel Administrativo
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestión de Asistentes y Diplomas</p>
        </div>
      </div>

      <AdminClient 
        initialAsistentes={asistentes} 
        initialClave={config?.valor || ''} 
      />

    </main>
  )
}
