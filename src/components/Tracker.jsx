import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'
import './Tracker.css'

function Tracker({ user }) {
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar sesión activa al montar el componente
  useEffect(() => {
    const checkActiveSession = async () => {
      setLoading(true)
      try {
        // Buscar si hay alguna sesión que no esté completada (active o paused)
        const { data, error } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'paused'])
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setActiveSession(data)
      } catch (err) {
        console.error("Error verificando sesión:", err.message)
      } finally {
        setLoading(false)
      }
    }

    checkActiveSession()
  }, [user])

  // Iniciar Jornada
  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      // Verificar doble seguridad: no permitir si ya hay activa (aunque la UI lo oculte)
      if (activeSession) return

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
          pause_time: new Date().toISOString()
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

  // Reanudar Jornada
  const handleResume = async () => {
    if (!activeSession) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .update({ 
          status: 'active',
          pause_time: null // Opcional: limpiar pausa anterior o mantener histórico
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
      setActiveSession(null)
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
               onClick={handleResume} 
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
