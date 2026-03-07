import { supabase } from "../config/supabaseClient";

/**
 * Servicio para gestionar las sesiones de trabajo y pausas.
 * Sigue la regla de separación de lógica de negocio y capa de datos.
 */

export const sessionsService = {
  /**
   * Obtiene la sesión activa (o pausada) del usuario actual.
   */
  async getActiveSession(userId) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .select(`
          *,
          work_pauses (*)
        `)
        .eq("user_id", userId)
        .in("status", ["active", "paused"])
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error en getActiveSession:", error.message);
      throw error;
    }
  },

  /**
   * Inicia una nueva sesión de trabajo.
   */
  async startSession(userId) {
    if (!userId) throw new Error("User ID is required");

    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .insert([
          {
            user_id: userId,
            status: "active",
            start_time: new Date().toISOString(),
            duration: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error en startSession:", error.message);
      throw error;
    }
  },

  /**
   * Registra el inicio de una pausa.
   */
  async startPause(sessionId, userId, currentDuration) {
    if (!sessionId || !userId) throw new Error("Session ID and User ID are required");

    try {
      // 1. Actualizar el estado de la sesión
      const { error: sessionError } = await supabase
        .from("work_sessions")
        .update({
          status: "paused",
          pause_time: new Date().toISOString(),
          duration: currentDuration,
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      // 2. Crear el registro en work_pauses
      const { data: pauseData, error: pauseError } = await supabase
        .from("work_pauses")
        .insert([
          {
            session_id: sessionId,
            user_id: userId,
            start_time: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (pauseError) throw pauseError;

      return pauseData;
    } catch (error) {
      console.error("Error en startPause:", error.message);
      throw error;
    }
  },

  /**
   * Registra el fin de una pausa.
   */
  async resumeSession(sessionId, userId) {
    if (!sessionId || !userId) throw new Error("Session ID and User ID are required");

    try {
      // 1. Buscar la última pausa activa (sin end_time)
      const { data: lastPause, error: findPauseError } = await supabase
        .from("work_pauses")
        .select("*")
        .eq("session_id", sessionId)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findPauseError) throw findPauseError;

      if (lastPause) {
        // 2. Finalizar la pausa
        const { error: updatePauseError } = await supabase
          .from("work_pauses")
          .update({ end_time: new Date().toISOString() })
          .eq("id", lastPause.id);

        if (updatePauseError) throw updatePauseError;
      }

      // 3. Reactivar la sesión
      const { data: sessionData, error: sessionError } = await supabase
        .from("work_sessions")
        .update({
          status: "active",
          start_time: new Date().toISOString(), // Actualizamos start_time para el cálculo del timer si es necesario, o mantenemos la lógica anterior
          pause_time: null,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (sessionError) throw sessionError;

      return sessionData;
    } catch (error) {
      console.error("Error en resumeSession:", error.message);
      throw error;
    }
  },

  /**
   * Finaliza la sesión de trabajo.
   */
  async stopSession(sessionId, finalDuration) {
    if (!sessionId) throw new Error("Session ID is required");

    try {
      const { data, error } = await supabase
        .from("work_sessions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          duration: finalDuration,
          pause_time: null,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error en stopSession:", error.message);
      throw error;
    }
  }
};
