'use client'

import { useState } from 'react'
import { Asistente } from '@prisma/client'
import { guardarClave, enviarDiplomas } from './adminActions'

interface AdminClientProps {
  initialAsistentes: Asistente[]
  initialClave: string
}

export default function AdminClient({ initialAsistentes, initialClave }: AdminClientProps) {
  const [asistentes, setAsistentes] = useState<Asistente[]>(initialAsistentes)
  const [clave, setClave] = useState(initialClave)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [savingConfig, setSavingConfig] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === asistentes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(asistentes.map(a => a.id)))
    }
  }

  const handleSaveClave = async () => {
    setSavingConfig(true)
    await guardarClave(clave)
    setSavingConfig(false)
    alert('Palabra clave guardada exitosamente.')
  }

  const handleImprimir = () => {
    const seleccionados = asistentes.filter(a => selectedIds.has(a.id))
    if (seleccionados.length === 0) return alert('Selecciona al menos un asistente.')
    
    // Abrir vista de impresión
    const url = `/print?ids=${Array.from(selectedIds).join(',')}`
    window.open(url, '_blank')
  }

  const handleEnviar = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return alert('Selecciona al menos un asistente.')
    
    setSendingEmails(true)
    const res = await enviarDiplomas(ids)
    setSendingEmails(false)

    if (res.error) alert(res.error)
    else {
      alert(`¡Se enviaron ${res.count} correos correctamente!`)
      // Limpiar seleccion actual para forzar refresh visual (el revalidatePath de next se encarga del resto)
      setSelectedIds(new Set())
    }
  }

  return (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Configuración del Evento</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Palabra Clave (Contraseña de Registro Público)
            </label>
            <input 
              type="text" 
              value={clave}
              onChange={e => setClave(e.target.value)}
              placeholder="Ej. Congreso2024" 
            />
          </div>
          <button onClick={handleSaveClave} disabled={savingConfig}>
            {savingConfig ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Asistentes ({asistentes.length})</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleImprimir} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              🖨️ Imprimir Seleccionados
            </button>
            <button onClick={handleEnviar} disabled={sendingEmails}>
              {sendingEmails ? 'Enviando...' : '📧 Enviar Diplomas'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === asistentes.length}
                    onChange={toggleAll}
                  />
                </th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nombre</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contacto</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Colegiado</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {asistentes.map(asistente => {
                const prefijo = asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : ''
                const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()
                
                return (
                <tr key={asistente.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(asistente.id)}
                      onChange={() => toggleSelect(asistente.id)}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>#{asistente.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{nombreCompleto}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div>{asistente.correo}</div>
                    <div>{asistente.celular}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{asistente.colegiado || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.85rem',
                      background: asistente.estado === 'Pendiente' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: asistente.estado === 'Pendiente' ? '#facc15' : '#4ade80'
                    }}>
                      {asistente.estado}
                    </span>
                  </td>
                </tr>
              )})}
              {asistentes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay asistentes registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
