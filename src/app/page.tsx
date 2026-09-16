'use client'

import { useState, useEffect } from 'react'
import { registrarAsistente } from './actions'

const FONDOS = ['/fondo1.jpg', '/fondo2.jpg', '/fondo3.jpg']

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const [success, setSuccess] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % FONDOS.length)
    }, 5000) // Cambia cada 5 segundos

    // Verificar si el dispositivo ya alcanzó el límite
    const conteo = parseInt(localStorage.getItem('registros_realizados') || '0', 10)
    if (conteo >= 2) {
      setMessage({
        text: '⚠️ Este dispositivo ya ha alcanzado el límite máximo de 2 registros. Si necesitas asistencia adicional, por favor dirígete a la mesa de registro.',
        type: 'error'
      })
    }

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Verificar límite de dispositivo
    const conteo = parseInt(localStorage.getItem('registros_realizados') || '0', 10)
    if (conteo >= 2) {
      setMessage({
        text: '⚠️ Este dispositivo ya ha alcanzado el límite máximo de 2 registros permitidos.',
        type: 'error'
      })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const res = await registrarAsistente(formData)

    if (res?.error) {
      setMessage({ text: res.error, type: 'error' })
    } else if (res?.success) {
      localStorage.setItem('registros_realizados', (conteo + 1).toString())
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      backgroundImage: `url(${FONDOS[bgIndex]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      transition: 'background-image 1s ease-in-out'
    }}>
      
      {/* Capa de desenfoque general */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 0
      }} />

      {/* Contenedor Principal Responsive */}
      <div className="animate-fade-in main-container" style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%', 
        maxWidth: '1000px', 
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        overflow: 'hidden',
        minHeight: '600px'
      }}>
        
        {/* CSS inyectado para Responsive Mobile-First */}
        <style dangerouslySetInnerHTML={{__html: `
          .main-container {
            flex-direction: column;
          }
          .left-panel {
            padding: 3rem 1rem 2rem 1rem !important;
            min-height: 400px;
          }
          .form-panel {
            padding: 2rem 1.5rem !important;
          }
          .input-row {
            flex-direction: column;
          }
          @media (min-width: 768px) {
            .main-container {
              flex-direction: row;
            }
            .left-panel {
              flex: 1;
              padding: 2rem !important;
            }
            .form-panel {
              flex: 1;
              padding: 3rem 2.5rem !important;
            }
            .input-row {
              flex-direction: row;
            }
          }
        `}} />

        {/* Mitad Izquierda / Arriba en Móvil (Información del evento) */}
        <div style={{
          backgroundImage: `url(${FONDOS[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-image 1s ease-in-out'
        }} className="left-panel">
          
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Contenedor de Logos */}
            <div style={{ 
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.15)', // Más transparente
              backdropFilter: 'blur(8px)', // Efecto Glassmorphism
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', // Borde sutil
              padding: '0.8rem 1.2rem',
              borderRadius: '1rem', 
              margin: '0 auto 1.5rem',
              boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
              width: 'fit-content',
              flexWrap: 'wrap'
            }}>
              <img src="/logo1.png" alt="Logo 1" style={{ width: '65px', height: 'auto', objectFit: 'contain' }} />
              <img src="/logo2.png" alt="Logo 2" style={{ width: '65px', height: 'auto', objectFit: 'contain' }} />
              <img src="/logo3.png" alt="Logo 3" style={{ width: '65px', height: 'auto', objectFit: 'contain' }} />
              <img src="/logo4.png" alt="Logo 4" style={{ width: '65px', height: 'auto', objectFit: 'contain' }} />
            </div>

            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Registro Oficial de Asistencia
            </p>
            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.1 }}>
              XIX CONGRESO REGIONAL<br/>DE MEDICINA
            </h2>
            <p style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Avances Tecnológicos de Última Generación
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Y su aplicación en la práctica médica actual
            </p>
            <p style={{ color: '#fff', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }}>
              "sin olvidar los fundamentos básicos de la medicina"
            </p>
          </div>
        </div>


        {/* Mitad Derecha / Abajo en Móvil (Formulario Blanco) */}
        <div className="form-panel" style={{
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          {success ? (
            <div style={{ textAlign: 'center' }} className="animate-fade-in">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h1 style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '1.8rem' }}>¡Registro Exitoso!</h1>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                Tus datos han sido guardados correctamente.<br/><br/>
                Por favor, acércate a la mesa de registro para recibir tu diploma impreso o espera a recibirlo en tu correo al finalizar el evento.
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1e293b', fontWeight: 700 }}>
                  Bienvenido
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Ingresa tus datos para generar tu diploma
                </p>
              </div>

              {message && (
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  marginBottom: '1.5rem',
                  background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                  color: message.type === 'error' ? '#ef4444' : '#22c55e',
                  border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label htmlFor="nombre" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                    Nombre Completo
                  </label>
                  <input type="text" id="nombre" name="nombre" placeholder="Ej. Juan Pérez" required disabled={loading} style={{
                    width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                  }}/>
                </div>

                <div className="input-row" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="correo" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                      Correo Electrónico
                    </label>
                    <input type="email" id="correo" name="correo" placeholder="correo@ejemplo.com" required disabled={loading} style={{
                      width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                    }}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="celular" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                      Celular
                    </label>
                    <input type="tel" id="celular" name="celular" placeholder="5555-5555" required disabled={loading} style={{
                      width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                    }}/>
                  </div>
                </div>

                <div className="input-row" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="colegiado" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                      No. Colegiado
                    </label>
                    <input type="text" id="colegiado" name="colegiado" placeholder="12345" required disabled={loading} style={{
                      width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                    }}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="genero" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                      Género
                    </label>
                    <select id="genero" name="genero" required disabled={loading} style={{
                      width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                    }}>
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="clave" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                    Contraseña del evento
                  </label>
                  <input type="password" id="clave" name="clave" placeholder="••••••••" required disabled={loading} style={{
                    width: '100%', padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b'
                  }}/>
                </div>

                <button type="submit" disabled={loading} style={{ 
                  marginTop: '1.5rem', 
                  opacity: loading ? 0.7 : 1,
                  background: '#22c55e', 
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '0.4rem',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)',
                  transition: 'all 0.2s ease'
                }}>
                  {loading ? 'Procesando...' : 'Ingresar al sistema'}
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
