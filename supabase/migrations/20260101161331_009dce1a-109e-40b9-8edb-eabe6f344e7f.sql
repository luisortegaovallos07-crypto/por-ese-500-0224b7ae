-- Eliminar políticas SELECT existentes
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;

-- Crear nuevas políticas con verificación explícita de autenticación
CREATE POLICY "Admins pueden ver todos los perfiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Actualizar política de UPDATE para requerir autenticación explícita
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Actualizar política de INSERT para requerir autenticación explícita
DROP POLICY IF EXISTS "Admins pueden insertar perfiles" ON public.profiles;
CREATE POLICY "Admins pueden insertar perfiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = id);

-- Actualizar política de DELETE para requerir autenticación explícita
DROP POLICY IF EXISTS "Admins pueden eliminar perfiles" ON public.profiles;
CREATE POLICY "Admins pueden eliminar perfiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));