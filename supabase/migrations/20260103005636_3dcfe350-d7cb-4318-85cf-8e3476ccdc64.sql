-- Drop existing update policy
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;

-- Create new update policies
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins pueden actualizar todos los perfiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));