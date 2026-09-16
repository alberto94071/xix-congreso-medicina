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
  const [activeTab, setActiveTab] = useState<'pendientes' | 'enviados' | 'todos'>('pendientes')

  // Filtrar asistentes según pestaña activa
  const filteredAsistentes = asistentes.filter(a => {
    if (activeTab === 'pendientes') return a.estado !== 'Enviado'
    if (activeTab === 'enviados') return a.estado === 'Enviado'
    return true
  })

  // Conteo por estado
  const pendientesCount = asistentes.filter(a => a.estado !== 'Enviado').length
  const enviadosCount = asistentes.filter(a => a.estado === 'Enviado').length
  const todosCount = asistentes.length

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    const visibleIds = filteredAsistentes.map(a => a.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id))
    
    const next = new Set(selectedIds)
    if (allVisibleSelected) {
      visibleIds.forEach(id => next.delete(id))
    } else {
      visibleIds.forEach(id => next.add(id))
    }
    setSelectedIds(next)
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
      // Actualizar estado local para que se muevan automáticamente a la pestaña 'Enviados'
      setAsistentes(prev => prev.map(a => ids.includes(a.id) ? { ...a, estado: 'Enviado' } : a))
      setSelectedIds(new Set())
    }
  }

  const isAllVisibleSelected = filteredAsistentes.length > 0 && filteredAsistentes.every(a => selectedIds.has(a.id))

  return (
    <div>
      {/* Configuración del Evento */}
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

      {/* Pestañas de Navegación */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => { setActiveTab('pendientes'); setSelectedIds(new Set()); }}
          style={{
            background: activeTab === 'pendientes' ? '#3b82f6' : 'transparent',
            color: activeTab === 'pendientes' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          ⏳ Pendientes <span style={{ background: activeTab === 'pendientes' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', padding: '0.15rem 0.55rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{pendientesCount}</span>
        </button>

        <button 
          onClick={() => { setActiveTab('enviados'); setSelectedIds(new Set()); }}
          style={{
            background: activeTab === 'enviados' ? '#22c55e' : 'transparent',
            color: activeTab === 'enviados' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          ✅ Enviados <span style={{ background: activeTab === 'enviados' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', padding: '0.15rem 0.55rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{enviadosCount}</span>
        </button>

        <button 
          onClick={() => { setActiveTab('todos'); setSelectedIds(new Set()); }}
          style={{
            background: activeTab === 'todos' ? '#64748b' : 'transparent',
            color: activeTab === 'todos' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          📋 Todos <span style={{ background: activeTab === 'todos' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', padding: '0.15rem 0.55rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{todosCount}</span>
        </button>
      </div>

      {/* Tabla y Controles */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>
            {activeTab === 'pendientes' && 'Asistentes Pendientes'}
            {activeTab === 'enviados' && 'Diplomas Enviados'}
            {activeTab === 'todos' && 'Todos los Asistentes'}
            {' '}({filteredAsistentes.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleImprimir} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              🖨️ Imprimir Seleccionados
            </button>
            <button onClick={handleEnviar} disabled={sendingEmails}>
              {sendingEmails ? 'Enviando...' : activeTab === 'enviados' ? '📧 Re-enviar Diplomas' : '📧 Enviar Diplomas'}
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
                    checked={isAllVisibleSelected}
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
              {filteredAsistentes.map(asistente => {
                const prefijo = asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : ''
                const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()
                const isSelected = selectedIds.has(asistente.id)
                
                return (
                <tr 
                  key={asistente.id} 
                  onClick={() => toggleSelect(asistente.id)}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    transition: 'background 0.15s ease',
                    userSelect: 'none'
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>#{asistente.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{nombreCompleto}</td>
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
              {filteredAsistentes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron asistentes en esta sección.
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
