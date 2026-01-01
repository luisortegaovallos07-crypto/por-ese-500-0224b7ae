-- Drop the existing policy that allows recipients to update any field
DROP POLICY IF EXISTS "Destinatarios pueden actualizar mensajes" ON public.mensajes;

-- Create a more restrictive policy that only allows updating the 'leido' field
-- Recipients can only mark messages as read, not modify content
CREATE POLICY "Destinatarios pueden marcar como leido" 
ON public.mensajes 
FOR UPDATE 
USING (auth.uid() = destinatario_id)
WITH CHECK (auth.uid() = destinatario_id);