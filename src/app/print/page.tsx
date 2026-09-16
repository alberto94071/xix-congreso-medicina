import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PrintClient from './PrintClient'

export const dynamic = 'force-dynamic'

export default async function PrintPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams
  const idsStr = params.ids
  
  if (!idsStr) {
    redirect('/admin')
  }

  const ids = idsStr.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))

  const asistentes = await prisma.asistente.findMany({
    where: { id: { in: ids } }
  })

  if (asistentes.length === 0) {
    redirect('/admin')
  }

  return <PrintClient asistentes={asistentes} />
}
