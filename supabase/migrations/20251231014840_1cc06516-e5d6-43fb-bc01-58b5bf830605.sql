-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'profesor', 'estudiante');

-- Tabla de roles (primero, sin políticas)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar roles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas para user_roles
CREATE POLICY "Usuarios pueden ver sus propios roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todos los roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden insertar roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden actualizar roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden eliminar roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Tabla de perfiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden insertar perfiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

CREATE POLICY "Admins pueden eliminar perfiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Tabla de materias
CREATE TABLE public.materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6',
  icono TEXT DEFAULT 'BookOpen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver materias" ON public.materias
  FOR SELECT USING (true);

CREATE POLICY "Admins pueden gestionar materias" ON public.materias
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insertar materias por defecto
INSERT INTO public.materias (nombre, descripcion, color, icono) VALUES
  ('Matemáticas', 'Razonamiento cuantitativo y cálculo', '#EF4444', 'Calculator'),
  ('Lectura Crítica', 'Comprensión lectora y análisis de textos', '#3B82F6', 'BookOpen'),
  ('Sociales y Ciudadanas', 'Historia, geografía y competencias ciudadanas', '#10B981', 'Globe'),
  ('Ciencias Naturales', 'Biología, química y física', '#8B5CF6', 'Atom'),
  ('Inglés', 'Comprensión y uso del idioma inglés', '#F59E0B', 'Languages');

-- Tabla de preguntas
CREATE TABLE public.preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  opcion_a TEXT NOT NULL,
  opcion_b TEXT NOT NULL,
  opcion_c TEXT NOT NULL,
  opcion_d TEXT NOT NULL,
  respuesta_correcta TEXT NOT NULL CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D')),
  explicacion TEXT,
  imagen_url TEXT,
  activa BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver preguntas activas" ON public.preguntas
  FOR SELECT USING (activa = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden insertar preguntas" ON public.preguntas
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden actualizar preguntas" ON public.preguntas
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden eliminar preguntas" ON public.preguntas
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

-- Tabla de resultados de simulacros
CREATE TABLE public.resultados_simulacro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puntaje INTEGER NOT NULL CHECK (puntaje >= 0 AND puntaje <= 500),
  total_preguntas INTEGER NOT NULL,
  respuestas_correctas INTEGER NOT NULL,
  tiempo_segundos INTEGER NOT NULL,
  detalles JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.resultados_simulacro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios resultados" ON public.resultados_simulacro
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus resultados" ON public.resultados_simulacro
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todos los resultados" ON public.resultados_simulacro
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Tabla de materiales
CREATE TABLE public.materiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'video', 'resumen')),
  url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver materiales" ON public.materiales
  FOR SELECT USING (true);

CREATE POLICY "Admins y profesores pueden insertar materiales" ON public.materiales
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden actualizar materiales" ON public.materiales
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden eliminar materiales" ON public.materiales
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

-- Tabla de noticias
CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  autor TEXT NOT NULL,
  destacada BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver noticias" ON public.noticias
  FOR SELECT USING (true);

CREATE POLICY "Admins pueden insertar noticias" ON public.noticias
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden actualizar noticias" ON public.noticias
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins pueden eliminar noticias" ON public.noticias
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Insertar noticia de bienvenida
INSERT INTO public.noticias (titulo, contenido, autor, destacada) VALUES
  ('¡Bienvenidos a PORESE 500!', 'Te damos la bienvenida a nuestra plataforma de preparación para las pruebas Saber 11. Aquí encontrarás material de estudio, simulacros y todo lo necesario para alcanzar tu mejor puntaje.', 'Equipo PORESE 500', true);

-- Tabla de eventos del calendario
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME,
  tipo TEXT NOT NULL CHECK (tipo IN ('clase', 'simulacro', 'tarea', 'reunion', 'otro')),
  materia_id UUID REFERENCES public.materias(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver eventos" ON public.eventos
  FOR SELECT USING (true);

CREATE POLICY "Admins y profesores pueden insertar eventos" ON public.eventos
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden actualizar eventos" ON public.eventos
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

CREATE POLICY "Admins y profesores pueden eliminar eventos" ON public.eventos
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profesor'));

-- Tabla de mensajes de contacto
CREATE TABLE public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asunto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver mensajes enviados o recibidos" ON public.mensajes
  FOR SELECT USING (auth.uid() = remitente_id OR auth.uid() = destinatario_id);

CREATE POLICY "Usuarios pueden enviar mensajes" ON public.mensajes
  FOR INSERT WITH CHECK (auth.uid() = remitente_id);

CREATE POLICY "Destinatarios pueden actualizar mensajes" ON public.mensajes
  FOR UPDATE USING (auth.uid() = destinatario_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preguntas_updated_at
  BEFORE UPDATE ON public.preguntas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.email),
    NEW.email
  );
  
  -- Por defecto, asignar rol de estudiante
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'estudiante');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();