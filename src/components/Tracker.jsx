import { useState, useEffect } from "react";
import { sessionsService } from "../services/sessionsService";
import "./Tracker.css";

/**
 * Componente Tracker: Gestiona el inicio, pausa y fin de la jornada.
 * Sigue el DoD de UI de RPSoft.
 */
function Tracker({ user }) {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  // Formatear segundos a HH:MM:SS
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Efecto del Temporizador
  useEffect(() => {
    let interval = null;

    if (activeSession?.status === "active") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [activeSession?.status]);

  // Cargar sesión activa al montar o cambiar usuario
  useEffect(() => {
    const fetchActiveSession = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await sessionsService.getActiveSession(user.id);
        
        if (data) {
          setActiveSession(data);

          if (data.status === "active") {
            // Cálculo del tiempo transcurrido
            const startTime = new Date(data.start_time);
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000);
            const accumulated = data.duration || 0;
            setDuration(accumulated + elapsed);
          } else {
            setDuration(data.duration || 0);
          }
        } else {
          setActiveSession(null);
          setDuration(0);
        }
      } catch (err) {
        setError("No se pudo cargar la sesión actual. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();
  }, [user]);

  // Iniciar Jornada
  const handleStart = async () => {
    if (!user?.id || activeSession) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sessionsService.startSession(user.id);
      setActiveSession(data);
      setDuration(0);
    } catch (err) {
      setError("Error al iniciar la jornada: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pausar Jornada (Nueva lógica con tabla work_pauses)
  const handlePause = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      await sessionsService.startPause(activeSession.id, user.id, duration);
      
      // Refrescamos los datos locales
      const updatedData = await sessionsService.getActiveSession(user.id);
      setActiveSession(updatedData);
    } catch (err) {
      setError("Error al pausar la jornada: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reanudar Jornada (Nueva lógica con tabla work_pauses)
  const handleResume = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sessionsService.resumeSession(activeSession.id, user.id);
      setActiveSession(data);
      // La duración se mantiene acumulada en el estado local
    } catch (err) {
      setError("Error al reanudar la jornada: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Finalizar Jornada
  const handleStop = async () => {
    if (!activeSession?.id) return;
    
    const confirmStop = window.confirm("¿Seguro que deseas finalizar tu jornada?");
    if (!confirmStop) return;

    setLoading(true);
    setError(null);
    try {
      await sessionsService.stopSession(activeSession.id, duration);
      setActiveSession(null);
      setDuration(0);
    } catch (err) {
      setError("Error al finalizar la jornada: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !activeSession) {
    return <div className="tracker-loading">Cargando estado...</div>;
  }

  return (
    <div className="tracker-container">
      <h3>Acciones Rápidas</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="controls">
        {!activeSession ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="tracker-btn-start"
          >
            {loading ? "Iniciando..." : "Iniciar Jornada"}
          </button>
        ) : (
          <div className="tracker-active-controls">
            <div className={`tracker-status-badge status-${activeSession.status}`}>
              {activeSession.status === "active" ? "● En curso" : "⏸ Pausado"}
            </div>

            <div className="tracker-action-buttons">
              {activeSession.status === "active" && (
                <button
                  onClick={handlePause}
                  disabled={loading}
                  className="tracker-btn-pause"
                >
                  {loading ? "..." : "Pausar"}
                </button>
              )}

              {activeSession.status === "paused" && (
                <button
                  onClick={handleResume}
                  disabled={loading}
                  className="tracker-btn-resume"
                >
                  {loading ? "..." : "Reanudar"}
                </button>
              )}

              <button
                onClick={handleStop}
                disabled={loading}
                className="tracker-btn-stop"
              >
                Finalizar Jornada
              </button>
            </div>

            <div className="tracker-status-display">
              <div className="tracker-timer-display">{formatDuration(duration)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tracker;
