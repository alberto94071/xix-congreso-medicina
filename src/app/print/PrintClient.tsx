'use client'

import { useEffect } from 'react'
import { Asistente } from '@prisma/client'

// Este componente utiliza window.print() nativo.
export default function PrintClient({ asistentes }: { asistentes: Asistente[] }) {
  
  useEffect(() => {
    // Al cargar la página, abrir el diálogo de impresión automáticamente
    // Se da un pequeño delay para asegurar que las fuentes/imágenes carguen
    const timer = setTimeout(() => {
      window.print()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      {/* Estilos específicos para impresión */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 0; /* Sin márgenes para que cubra toda la hoja */
          }
          body {
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .diploma-page {
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .diploma-page {
          width: 100vw;
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('/diploma-base.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          overflow: hidden;
          box-sizing: border-box;
        }

        .diploma-name {
          font-size: 3.5rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          margin-top: 2%; 
        }
      `}} />

      <div className="no-print" style={{ padding: '1rem', background: '#3b82f6', color: '#fff', textAlign: 'center' }}>
        <p>Preparando documento para impresión...</p>
        <button onClick={() => window.print()} style={{ marginTop: '0.5rem', background: '#fff', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          🖨️ Imprimir Ahora
        </button>
      </div>

      {asistentes.map((asistente) => {
        const prefijo = asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : ''
        const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()
        
        return (
          <div key={asistente.id} className="diploma-page">
            <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 4rem', textAlign: 'center' }}>
              <h2 className="diploma-name">{nombreCompleto}</h2>
            </div>
          </div>
        )
      })}

    </div>
  )
}
