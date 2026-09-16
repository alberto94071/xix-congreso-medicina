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
          /* Aquí iría la imagen de fondo de Canva, por ahora un fondo placeholder */
          background-color: #f8fafc;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .diploma-name {
          font-size: 4rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          /* Ajustar la posición vertical según el diseño en Canva */
          margin-top: 5%; 
        }
      `}} />

      <div className="no-print" style={{ padding: '1rem', background: '#3b82f6', color: '#fff', textAlign: 'center' }}>
        <p>Preparando documento para impresión...</p>
        <button onClick={() => window.print()} style={{ marginTop: '0.5rem', background: '#fff', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Imprimir Ahora
        </button>
      </div>

      {asistentes.map((asistente, i) => {
        const prefijo = asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : ''
        const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()
        
        return (
          <div key={asistente.id} className="diploma-page" style={{ /* backgroundImage: "url('/diploma-fondo.png')" */ }}>
            <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 4rem' }}>
              <h2 className="diploma-name">{nombreCompleto}</h2>
            </div>
          </div>
        )
      })}

    </div>
  )
}
