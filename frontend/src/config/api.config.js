export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  endpoints: {
    // Auth
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me'
    },
    // Usuarios
    alumnos: {
      general: '/alumnos',
      sin_matricula: '/alumnos/sin_matricula',
    },
    instructores: '/instructores',
    administradores: '/administradores',
    // Academico
    matriculas: '/matriculas',
    pagos: '/pagos',
    asistencias: '/asistencias',
    tickets: '/tickets',
    // Recursos
    paquetes: '/paquetes',
    autos: '/autos',
    bloques: '/bloques/disponibles',
    reservas: '/reservas',
    // Reportes
    reportes: '/reportes'
  }
};