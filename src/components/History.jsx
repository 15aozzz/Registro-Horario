import { useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'
import './History.css'

function History({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })

        if (error) throw error


        setSessions(data)
      } catch (err) {
        console.error('Error cargando historial:', err.message)
        setError('No se pudo cargar el historial. Inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user])

  const formatDate = (isoString) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Devuelve solo la parte de hora HH:MM de una fecha ISO
  const formatTime = (isoString) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  /**
   * Descompone segundos totales en { hours, minutes, seconds }.
   * Devuelve null si la sesión aún no tiene duración registrada.
   */
  const parseDuration = (totalSeconds, status) => {
    // Sesión activa o pausada sin duración persistida aún → en curso
    if ((totalSeconds === null || totalSeconds === undefined) && status !== 'completed') {
      return null
    }
    const secs = totalSeconds ?? 0
    return {
      hours:   Math.floor(secs / 3600),
      minutes: Math.floor((secs % 3600) / 60),
      seconds: secs % 60,
    }
  }

  const statusLabel = (status) => {
    if (status === 'active') return 'Activo'
    if (status === 'paused') return 'Pausado'
    return 'Finalizado'
  }

  if (loading) return <div className="history-loading">Cargando historial…</div>
  if (error)   return <div className="history-error" role="alert">{error}</div>

  return (
    <div className="history-container">
      <h3>Historial de Jornadas</h3>
      <div className="history-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No hay registros aún.</p>
        ) : (
          sessions.map(session => {
            const dur = parseDuration(session.duration, session.status)
            return (
              <div key={session.id} className="history-card">
                <div className="history-info">
                  <span className="history-date">{formatDate(session.start_time).split(',')[0]}</span>
                  <span className={`history-status status-${session.status}`}>
                    {statusLabel(session.status)}
                  </span>
                </div>

                <div className="history-times">
                  {/* Entrada */}
                  <div className="history-time-block">
                    <span className="label">Entrada</span>
                    <span className="value">{formatTime(session.start_time)}</span>
                  </div>

                  {/* Salida */}
                  <div className="history-time-block">
                    <span className="label">Salida</span>
                    <span className="value">{formatTime(session.end_time)}</span>
                  </div>

                  {/* Duración */}
                  <div className="history-time-block history-time-block--duration">
                    <span className="label">Duración</span>
                    {dur === null ? (
                      <span className="value history-duration history-duration--live">
                        En curso
                      </span>
                    ) : (
                      <span className="value history-duration">
                        {dur.hours > 0 && (
                          <><span className="dur-num">{dur.hours}</span><span className="dur-unit">h</span>{' '}</>
                        )}
                        {(dur.hours > 0 || dur.minutes > 0) && (
                          <><span className="dur-num">{dur.minutes}</span><span className="dur-unit">m</span>{' '}</>
                        )}
                        <span className="dur-num">{dur.seconds}</span><span className="dur-unit">s</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default History
