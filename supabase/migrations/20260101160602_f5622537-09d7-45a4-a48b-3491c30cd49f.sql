-- Eliminar la política existente de SELECT
DROP POLICY IF EXISTS "Todos pueden ver preguntas activas" ON public.preguntas;

-- Crear una vista segura que NO muestra respuestas para estudiantes
CREATE OR REPLACE VIEW public.preguntas_simulacro AS
SELECT 
  id,
  materia_id,
  pregunta,
  opcion_a,
  opcion_b,
  opcion_c,
  opcion_d,
  imagen_url,
  activa
FROM public.preguntas
WHERE activa = true;

-- Dar permisos de SELECT a la vista
GRANT SELECT ON public.preguntas_simulacro TO authenticated;

-- Política para que admins y profesores vean TODAS las preguntas (incluyendo respuestas)
CREATE POLICY "Admins y profesores pueden ver todas las preguntas" 
ON public.preguntas 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'profesor'::app_role));

-- Política para que estudiantes NO puedan ver la tabla directamente
-- (usarán la vista preguntas_simulacro que no tiene respuestas)