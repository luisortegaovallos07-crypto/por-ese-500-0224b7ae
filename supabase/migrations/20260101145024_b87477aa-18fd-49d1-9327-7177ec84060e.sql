-- Agregar columna de tiempo por materia para simulacros (en segundos)
ALTER TABLE public.materias 
ADD COLUMN IF NOT EXISTS tiempo_simulacro INTEGER NOT NULL DEFAULT 1800;

-- Actualizar la tabla resultados_simulacro para incluir materia_id
ALTER TABLE public.resultados_simulacro 
ADD COLUMN IF NOT EXISTS materia_id UUID REFERENCES public.materias(id);

-- Agregar índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_resultados_materia ON public.resultados_simulacro(materia_id);
CREATE INDEX IF NOT EXISTS idx_resultados_user ON public.resultados_simulacro(user_id);

-- Agregar política para que profesores puedan ver resultados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resultados_simulacro' 
    AND policyname = 'Profesores pueden ver todos los resultados'
  ) THEN
    CREATE POLICY "Profesores pueden ver todos los resultados" 
    ON public.resultados_simulacro 
    FOR SELECT 
    USING (has_role(auth.uid(), 'profesor'::app_role));
  END IF;
END $$;

-- Agregar columna imagen_url a preguntas si no existe
ALTER TABLE public.preguntas 
ADD COLUMN IF NOT EXISTS imagen_url TEXT;