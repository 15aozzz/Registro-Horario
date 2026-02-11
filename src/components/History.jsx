import { useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'
import './History.css'

function History({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error cargando historial:', error.message)
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

  const calculateDuration = (start, end) => {
    if (!end) return 'En curso'
    const diff = new Date(end) - new Date(start)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  if (loading) return <div className="history-loading">Cargando historial...</div>

  return (
    <div className="history-container">
      <h3>Historial de Jornadas</h3>
      <div className="history-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No hay registros aún.</p>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="history-card">
              <div className="history-info">
                <span className="history-date">{formatDate(session.start_time).split(',')[0]}</span>
                <span className={`history-status status-${session.status}`}>
                  {session.status === 'active' ? '🟢 Activo' : 
                   session.status === 'paused' ? '⏸️ Pausado' : '🔴 Finalizado'}
                </span>
              </div>
              <div className="history-times">
                <div>
                  <span className="label">Entrada</span>
                  <span className="value">{formatDate(session.start_time).split(',')[1]}</span>
                </div>
                <div>
                  <span className="label">Salida</span>
                  <span className="value">{formatDate(session.end_time).split(',')[1]}</span>
                </div>
                <div>
                  <span className="label">Duración</span>
                  <span className="value duration">{calculateDuration(session.start_time, session.end_time)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default History
