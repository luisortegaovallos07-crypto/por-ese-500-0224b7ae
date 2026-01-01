-- Add policy to allow admins to delete simulation results
CREATE POLICY "Admins pueden eliminar resultados" 
ON public.resultados_simulacro 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));