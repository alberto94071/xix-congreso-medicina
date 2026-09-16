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
          background-image: url('/diploma-base.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          overflow: hidden;
          box-sizing: border-box;
        }

        .diploma-name-container {
          position: absolute;
          top: 56%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 85%;
          text-align: center;
        }

        .diploma-name {
          font-size: 2.8rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }
      `}} />

      <div className="no-print" style={{ padding: '1rem', background: '#3b82f6', color: '#fff', textAlign: 'center' }}>
        <p>Preparando documento para impresión...</p>
        <button onClick={() => window.print()} style={{ marginTop: '0.5rem', background: '#fff', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          🖨️ Imprimir Ahora
        </button>
      </div>

      {asistentes.map((asistente) => {
        const tipoAsistente = (asistente as any).tipo || 'Doctor'
        const isDoctor = tipoAsistente !== 'General'
        const prefijo = isDoctor ? (asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : '') : ''
        const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()
        
        return (
          <div key={asistente.id} className="diploma-page">
            <div className="diploma-name-container">
              <h2 className="diploma-name">{nombreCompleto}</h2>
            </div>
          </div>
        )
      })}

    </div>
  )
}
