-- Recrear la vista preguntas_simulacro como SECURITY INVOKER
DROP VIEW IF EXISTS public.preguntas_simulacro;

CREATE VIEW public.preguntas_simulacro
WITH (security_invoker = true)
AS
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
FROM public.preguntas;

-- Comentario explicativo
COMMENT ON VIEW public.preguntas_simulacro IS 'Vista para simulacros que oculta respuesta_correcta y explicacion. Usa SECURITY INVOKER para respetar RLS del usuario.';