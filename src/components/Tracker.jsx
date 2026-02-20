import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import "./Tracker.css";

function Tracker({ user }) {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // Cargar sesión activa al montar el componente
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("work_sessions")
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["active", "paused"])
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setActiveSession(data);

          if (data.status === "active") {
            // Calcular tiempo transcurrido desde start_time más la duración acumulada
            const startTime = new Date(data.start_time);
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000);
            // Si hay duración acumulada previa (de pausas anteriores), la sumamos
            const accumulated = data.duration || 0;
            setDuration(accumulated + elapsed);
          } else {
            setDuration(data.duration || 0);
          }
        }
      } catch (err) {
        console.error("Error verificando sesión:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkActiveSession();
  }, [user]);

  // Iniciar Jornada
  const handleStart = async () => {
    if (!user?.id || activeSession) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .insert([
          {
            user_id: user.id,
            status: "active",
            start_time: new Date().toISOString(),
            duration: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      setDuration(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pausar Jornada
  const handlePause = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .update({
          status: "paused",
          pause_time: new Date().toISOString(),
          duration: duration,
        })
        .eq("id", activeSession.id)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reanudar Jornada
  const handleResume = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Al reanudar, actualizamos start_time al momento actual para que el
      // cronómetro calcule correctamente desde aquí, sumando la duración acumulada
      const { data, error } = await supabase
        .from("work_sessions")
        .update({
          status: "active",
          start_time: new Date().toISOString(),
          pause_time: null,
        })
        .eq("id", activeSession.id)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      // duration se mantiene en el estado local (acumulado antes de la pausa)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Finalizar Jornada
  const handleStop = async () => {
    if (!activeSession?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          duration: duration,
        })
        .eq("id", activeSession.id)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(null);
      setDuration(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracker-container">
      <h3>Acciones Rápidas</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="controls">
        {!activeSession ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-start"
          >
            {loading ? "Iniciando..." : "Iniciar Jornada"}
          </button>
        ) : (
          <div className="active-controls">
            <div className={`status-badge status-${activeSession.status}`}>
              {activeSession.status === "active" ? "● En curso" : "⏸ Pausado"}
            </div>

            <div className="action-buttons">
              {activeSession.status === "active" && (
                <button
                  onClick={handlePause}
                  disabled={loading}
                  className="btn-pause"
                >
                  Pausar
                </button>
              )}

              {activeSession.status === "paused" && (
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

            <div className="status-display">
              <div className="timer-display">{formatDuration(duration)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tracker;
