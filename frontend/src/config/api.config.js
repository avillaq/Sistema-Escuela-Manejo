export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL_PRODUCTION || import.meta.env.VITE_API_URL_DEVELOPMENT,
  timeout: 10000,
  endpoints: {
    // Auth
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      cambio_contrasena: '/auth/cambio-contrasena',
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
    bloques: '/bloques',
    reservas: '/reservas',
    // Reportes
    reportes: '/reportes'
  }
};