import { useState } from 'react'
import { supabase } from '../config/supabaseClient'
import './Tracker.css'

function Tracker({ user }) {
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Iniciar Jornada
  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert([
          { 
            user_id: user.id,
            status: 'active',
            start_time: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      setActiveSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Pausar Jornada
  const handlePause = async () => {
    if (!activeSession) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .update({ 
          status: 'paused',
          pause_time: new Date().toISOString() // timestamp de pausa
        })
        .eq('id', activeSession.id)
        .select()
        .single()

      if (error) throw error
      setActiveSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Finalizar Jornada
  const handleStop = async () => {
    if (!activeSession) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', activeSession.id)
        .select()
        .single()

      if (error) throw error
      setActiveSession(null) // Limpiar sesión activa al finalizar
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tracker-container">
      <h3>Registro de Jornada</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="controls">
        {!activeSession ? (
          <button 
            onClick={handleStart} 
            disabled={loading}
            className="btn-start"
          >
            Iniciar Jornada
          </button>
        ) : (
          <div className="active-controls">
            <div className="status-display">
              Estado: <span className={`status-${activeSession.status}`}>
                {activeSession.status === 'active' ? 'Trabajando' : 'Pausado'}
              </span>
            </div>
            
            {activeSession.status === 'active' && (
              <button 
                onClick={handlePause} 
                disabled={loading}
                className="btn-pause"
              >
                Pausar
              </button>
            )}
            
            {activeSession.status === 'paused' && (
               <button 
               onClick={() => {
                 // Reanudar es reactivar la sesión (podría requerir lógica extra, 
                 // por ahora simplificamos reutilizando handleStart o update a active)
                 // Como MVP simple, volver a Iniciar Jornada crea nueva sesión.
                 // Si queremos reanudar, deberíamos actualizar status a 'active'.
                 // Para este MVP, asumiremos que Pausa es un estado temporal.
                 // Vamos a implementar reanudar simple:
                 const resume = async () => {
                    setLoading(true);
                    const { data, error } = await supabase
                      .from('work_sessions')
                      .update({ status: 'active', pause_time: null }) // Limpiamos pausa o guardamos logica compleja
                      .eq('id', activeSession.id)
                      .select().single();
                    if(!error) setActiveSession(data);
                    setLoading(false);
                 };
                 resume();
               }} 
               disabled={loading}
               className="btn-resume"
             >
               Reanudar
             </button>
            )}

            <button 
              onClick={handleStop} 
              disabled={loading}
              className="btn-stop"
            >
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tracker
