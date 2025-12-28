// POR ESE 500 - Mock Data for Academic Platform
// Test Admin User: Daniel Ortega

export type UserRole = 'admin' | 'profesor' | 'estudiante';

export interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  activo: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  resumen: string;
  fecha: string;
  autor: string;
  imagen?: string;
  categoria: 'academico' | 'evento' | 'aviso' | 'general';
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo: 'simulacro' | 'taller' | 'entrega' | 'reunion' | 'examen';
  materia?: string;
}

export interface Materia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface ResultadoSimulacro {
  id: string;
  usuarioId: string;
  materiaId: string;
  fecha: string;
  puntaje: number;
  totalPreguntas: number;
  respuestasCorrectas: number;
  tiempoMinutos: number;
}

export interface MaterialEstudio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'pdf' | 'video' | 'resumen';
  url: string;
  materiaId: string;
  fecha: string;
}

// ============================================
// USUARIOS DE PRUEBA
// ============================================
export const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'daniel.ortega@porese500.edu',
    password: 'admin123',
    nombre: 'Daniel',
    apellido: 'Ortega',
    role: 'admin',
    activo: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'prof-001',
    email: 'maria.garcia@porese500.edu',
    password: 'profesor123',
    nombre: 'María',
    apellido: 'García',
    role: 'profesor',
    activo: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'prof-002',
    email: 'carlos.rodriguez@porese500.edu',
    password: 'profesor123',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    role: 'profesor',
    activo: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'est-001',
    email: 'ana.martinez@estudiante.edu',
    password: 'estudiante123',
    nombre: 'Ana',
    apellido: 'Martínez',
    role: 'estudiante',
    activo: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'est-002',
    email: 'luis.hernandez@estudiante.edu',
    password: 'estudiante123',
    nombre: 'Luis',
    apellido: 'Hernández',
    role: 'estudiante',
    activo: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'est-003',
    email: 'sofia.lopez@estudiante.edu',
    password: 'estudiante123',
    nombre: 'Sofía',
    apellido: 'López',
    role: 'estudiante',
    activo: true,
    createdAt: '2026-01-12',
  },
];

// ============================================
// MATERIAS
// ============================================
export const mockMaterias: Materia[] = [
  {
    id: 'mat-sociales',
    nombre: 'Sociales',
    descripcion: 'Historia, geografía, ciudadanía y competencias socioeconómicas',
    icono: 'Globe',
    color: 'bg-amber-500',
  },
  {
    id: 'mat-matematicas',
    nombre: 'Matemáticas',
    descripcion: 'Álgebra, geometría, estadística y razonamiento lógico-matemático',
    icono: 'Calculator',
    color: 'bg-blue-500',
  },
  {
    id: 'mat-ingles',
    nombre: 'Inglés',
    descripcion: 'Comprensión lectora, gramática y vocabulario en inglés',
    icono: 'Languages',
    color: 'bg-purple-500',
  },
  {
    id: 'mat-lectura',
    nombre: 'Lectura Crítica',
    descripcion: 'Análisis textual, interpretación y argumentación',
    icono: 'BookOpen',
    color: 'bg-emerald-500',
  },
  {
    id: 'mat-ciencias',
    nombre: 'Ciencias Naturales',
    descripcion: 'Biología, química, física y competencias científicas',
    icono: 'Microscope',
    color: 'bg-cyan-500',
  },
];

// ============================================
// NOTICIAS
// ============================================
export const mockNoticias: Noticia[] = [
  {
    id: 'not-001',
    titulo: 'Bienvenidos al Programa POR ESE 500 - 2026',
    contenido: `
      <p>Nos complace dar la bienvenida a todos los estudiantes al programa de preparación académica POR ESE 500 para el año 2026.</p>
      <p>Este año contamos con nuevas herramientas, simulacros actualizados y un equipo docente comprometido con tu éxito académico.</p>
      <p>Recuerda que "Donde cada día de disciplina acerca los sueños al 500".</p>
      <h3>Novedades 2026:</h3>
      <ul>
        <li>Simulacros adaptativos personalizados</li>
        <li>Material de estudio actualizado</li>
        <li>Seguimiento detallado del progreso</li>
        <li>Tutorías virtuales semanales</li>
      </ul>
    `,
    resumen: 'Iniciamos el programa de preparación académica 2026 con nuevas herramientas y recursos.',
    fecha: '2026-01-15',
    autor: 'Daniel Ortega',
    categoria: 'general',
  },
  {
    id: 'not-002',
    titulo: 'Primer Simulacro General - Febrero 2026',
    contenido: `
      <p>Se realizará el primer simulacro general del año el próximo 15 de febrero.</p>
      <p>El simulacro incluirá todas las materias y tendrá una duración de 4 horas.</p>
      <p>Los resultados estarán disponibles 48 horas después de la evaluación.</p>
    `,
    resumen: 'El primer simulacro general se realizará el 15 de febrero. Prepárate con anticipación.',
    fecha: '2026-01-20',
    autor: 'María García',
    categoria: 'academico',
  },
  {
    id: 'not-003',
    titulo: 'Taller de Estrategias de Lectura Crítica',
    contenido: `
      <p>Invitamos a todos los estudiantes al taller especial de estrategias para Lectura Crítica.</p>
      <p>Aprenderás técnicas efectivas para mejorar tu comprensión y análisis textual.</p>
      <p>Fecha: 25 de enero | Hora: 3:00 PM | Modalidad: Virtual</p>
    `,
    resumen: 'Taller virtual de técnicas para mejorar en Lectura Crítica. 25 de enero, 3:00 PM.',
    fecha: '2026-01-18',
    autor: 'Carlos Rodríguez',
    categoria: 'evento',
  },
  {
    id: 'not-004',
    titulo: 'Actualización de Material de Matemáticas',
    contenido: `
      <p>Hemos actualizado el material de estudio de Matemáticas con nuevos recursos.</p>
      <p>Incluye ejercicios prácticos, videos explicativos y resúmenes temáticos.</p>
      <p>Accede desde la sección de Material de Estudio.</p>
    `,
    resumen: 'Nuevos recursos de Matemáticas disponibles en la plataforma.',
    fecha: '2026-01-22',
    autor: 'María García',
    categoria: 'aviso',
  },
];

// ============================================
// EVENTOS DEL CALENDARIO
// ============================================
export const mockEventos: Evento[] = [
  {
    id: 'evt-001',
    titulo: 'Simulacro de Matemáticas',
    descripcion: 'Evaluación diagnóstica de matemáticas - 50 preguntas',
    fecha: '2026-02-01',
    hora: '09:00',
    tipo: 'simulacro',
    materia: 'Matemáticas',
  },
  {
    id: 'evt-002',
    titulo: 'Taller de Lectura Crítica',
    descripcion: 'Estrategias de análisis textual',
    fecha: '2026-01-25',
    hora: '15:00',
    tipo: 'taller',
    materia: 'Lectura Crítica',
  },
  {
    id: 'evt-003',
    titulo: 'Simulacro General',
    descripcion: 'Primer simulacro completo del año - Todas las materias',
    fecha: '2026-02-15',
    hora: '08:00',
    tipo: 'examen',
  },
  {
    id: 'evt-004',
    titulo: 'Entrega de Ejercicios Sociales',
    descripcion: 'Fecha límite para entregar ejercicios del módulo 1',
    fecha: '2026-02-10',
    hora: '23:59',
    tipo: 'entrega',
    materia: 'Sociales',
  },
  {
    id: 'evt-005',
    titulo: 'Reunión de Orientación',
    descripcion: 'Sesión informativa para estudiantes nuevos',
    fecha: '2026-01-30',
    hora: '10:00',
    tipo: 'reunion',
  },
  {
    id: 'evt-006',
    titulo: 'Simulacro de Inglés',
    descripcion: 'Evaluación de comprensión lectora en inglés',
    fecha: '2026-02-05',
    hora: '14:00',
    tipo: 'simulacro',
    materia: 'Inglés',
  },
  {
    id: 'evt-007',
    titulo: 'Taller de Ciencias Naturales',
    descripcion: 'Resolución de problemas de física y química',
    fecha: '2026-02-08',
    hora: '16:00',
    tipo: 'taller',
    materia: 'Ciencias Naturales',
  },
  {
    id: 'evt-008',
    titulo: 'Simulacro de Sociales',
    descripcion: 'Evaluación de competencias ciudadanas',
    fecha: '2026-02-20',
    hora: '09:00',
    tipo: 'simulacro',
    materia: 'Sociales',
  },
];

// ============================================
// RESULTADOS DE SIMULACROS
// ============================================
export const mockResultados: ResultadoSimulacro[] = [
  // Resultados para Ana Martínez (est-001)
  {
    id: 'res-001',
    usuarioId: 'est-001',
    materiaId: 'mat-matematicas',
    fecha: '2026-01-20',
    puntaje: 75,
    totalPreguntas: 50,
    respuestasCorrectas: 38,
    tiempoMinutos: 45,
  },
  {
    id: 'res-002',
    usuarioId: 'est-001',
    materiaId: 'mat-lectura',
    fecha: '2026-01-22',
    puntaje: 82,
    totalPreguntas: 40,
    respuestasCorrectas: 33,
    tiempoMinutos: 35,
  },
  {
    id: 'res-003',
    usuarioId: 'est-001',
    materiaId: 'mat-ingles',
    fecha: '2026-01-25',
    puntaje: 68,
    totalPreguntas: 45,
    respuestasCorrectas: 31,
    tiempoMinutos: 40,
  },
  // Resultados para Luis Hernández (est-002)
  {
    id: 'res-004',
    usuarioId: 'est-002',
    materiaId: 'mat-matematicas',
    fecha: '2026-01-20',
    puntaje: 88,
    totalPreguntas: 50,
    respuestasCorrectas: 44,
    tiempoMinutos: 42,
  },
  {
    id: 'res-005',
    usuarioId: 'est-002',
    materiaId: 'mat-ciencias',
    fecha: '2026-01-23',
    puntaje: 72,
    totalPreguntas: 45,
    respuestasCorrectas: 32,
    tiempoMinutos: 38,
  },
  // Resultados para Sofía López (est-003)
  {
    id: 'res-006',
    usuarioId: 'est-003',
    materiaId: 'mat-lectura',
    fecha: '2026-01-22',
    puntaje: 90,
    totalPreguntas: 40,
    respuestasCorrectas: 36,
    tiempoMinutos: 30,
  },
  {
    id: 'res-007',
    usuarioId: 'est-003',
    materiaId: 'mat-sociales',
    fecha: '2026-01-24',
    puntaje: 85,
    totalPreguntas: 50,
    respuestasCorrectas: 43,
    tiempoMinutos: 48,
  },
];

// ============================================
// MATERIAL DE ESTUDIO
// ============================================
export const mockMaterial: MaterialEstudio[] = [
  {
    id: 'mat-est-001',
    titulo: 'Guía de Álgebra Básica',
    descripcion: 'Fundamentos de álgebra con ejercicios resueltos',
    tipo: 'pdf',
    url: '#',
    materiaId: 'mat-matematicas',
    fecha: '2026-01-10',
  },
  {
    id: 'mat-est-002',
    titulo: 'Video: Ecuaciones Lineales',
    descripcion: 'Explicación paso a paso de ecuaciones lineales',
    tipo: 'video',
    url: '#',
    materiaId: 'mat-matematicas',
    fecha: '2026-01-12',
  },
  {
    id: 'mat-est-003',
    titulo: 'Resumen de Geografía Colombiana',
    descripcion: 'Regiones naturales y divisiones políticas',
    tipo: 'resumen',
    url: '#',
    materiaId: 'mat-sociales',
    fecha: '2026-01-08',
  },
  {
    id: 'mat-est-004',
    titulo: 'Técnicas de Lectura Rápida',
    descripcion: 'Guía para mejorar velocidad de lectura',
    tipo: 'pdf',
    url: '#',
    materiaId: 'mat-lectura',
    fecha: '2026-01-15',
  },
  {
    id: 'mat-est-005',
    titulo: 'Grammar Essentials',
    descripcion: 'Gramática inglesa fundamental',
    tipo: 'pdf',
    url: '#',
    materiaId: 'mat-ingles',
    fecha: '2026-01-14',
  },
  {
    id: 'mat-est-006',
    titulo: 'Video: Células y Organelos',
    descripcion: 'Estructura celular explicada',
    tipo: 'video',
    url: '#',
    materiaId: 'mat-ciencias',
    fecha: '2026-01-16',
  },
  {
    id: 'mat-est-007',
    titulo: 'Tabla Periódica Interactiva',
    descripcion: 'Resumen de elementos químicos',
    tipo: 'resumen',
    url: '#',
    materiaId: 'mat-ciencias',
    fecha: '2026-01-18',
  },
];

// ============================================
// ESTADÍSTICAS GLOBALES (para Admin)
// ============================================
export const mockEstadisticas = {
  totalUsuarios: mockUsers.length,
  totalEstudiantes: mockUsers.filter(u => u.role === 'estudiante').length,
  totalProfesores: mockUsers.filter(u => u.role === 'profesor').length,
  totalSimulacrosRealizados: mockResultados.length,
  promedioGeneral: Math.round(
    mockResultados.reduce((acc, r) => acc + r.puntaje, 0) / mockResultados.length
  ),
  materiasActivas: mockMaterias.length,
  eventosProximos: mockEventos.filter(e => new Date(e.fecha) > new Date('2026-01-20')).length,
};

// ============================================
// CREDENCIALES DE PRUEBA
// ============================================
export const credencialesPrueba = {
  admin: {
    email: 'daniel.ortega@porese500.edu',
    password: 'admin123',
    nombre: 'Daniel Ortega',
    role: 'Administrador',
  },
  profesor: {
    email: 'maria.garcia@porese500.edu',
    password: 'profesor123',
    nombre: 'María García',
    role: 'Profesor',
  },
  estudiante: {
    email: 'ana.martinez@estudiante.edu',
    password: 'estudiante123',
    nombre: 'Ana Martínez',
    role: 'Estudiante',
  },
};
