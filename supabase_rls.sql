-- ACTIVAR RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
ON public.work_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- POLÍTICA 2: Los usuarios pueden insertar sus propias sesiones
CREATE POLICY "Usuarios pueden insertar sus propias sesiones"
ON public.work_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- POLÍTICA 3: Los usuarios pueden actualizar sus propias sesiones
CREATE POLICY "Usuarios pueden actualizar sus propias sesiones"
ON public.work_sessions
FOR UPDATE
USING (auth.uid() = user_id);
