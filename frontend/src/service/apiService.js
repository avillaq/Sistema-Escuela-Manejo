import { api } from "@/service/axiosInstance";
import { API_CONFIG } from "@/config/api.config";

// Funcion adicional para manejar respuestas
const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
// Función para obtener mensajes de error
export const getErrorMessage = (error) => {
  const status = error.response?.status;
  
  switch (status) {
    case 401:
      const type = error.response?.data.error;
      if (type === "AuthenticationError") {
        return "Usuario o contraseña incorrectos."
      } else if (type === "ExpiredAccessError" || type === "ExpiredRefreshError") {
        return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else {
        return "No autorizado. Por favor, inicia sesión nuevamente.";
      }
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 429:
      return "Has superado el límite de solicitudes. Por favor, espera un momento antes de intentar de nuevo.";
    case 500:
      return "Error interno del servidor. Por favor, intenta más tarde.";
    default:
      return error.response?.data?.mensaje || error.message || "Ha ocurrido un error inesperado.";
  }
};

// Servicio de alumnos
export const alumnosService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.alumnos.general}/`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.alumnos.general}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.alumnos.general}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.alumnos.general}/${id}`)),
  getSinMatricula: () => handleResponse(() => api.get(API_CONFIG.endpoints.alumnos.sin_matricula))
};

// Servicio de instructores
export const instructoresService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.instructores}/`)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.instructores}/${id}`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.instructores}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.instructores}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.instructores}/${id}`)),
};

// Servicio de administradores
export const administradoresService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.administradores}/`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.administradores}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.administradores}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.administradores}/${id}`))
};

// Servicio de matrículas
export const matriculasService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.matriculas}/`)),
  getById: (matriculaId) => handleResponse(() => api.get(`${API_CONFIG.endpoints.matriculas}/`, { params: { id_matricula: matriculaId } })),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.matriculas}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.matriculas}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.matriculas}/${id}`)),
  getByAlumno: (alumnoId) => handleResponse(() => api.get(`${API_CONFIG.endpoints.matriculas}/`, { params: { id_alumno: alumnoId } }))
};

// Servicio de pagos
export const pagosService = {
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.pagos}/`, data)),
};

// Servicio de autenticacion
export const authService = {
  login: (username, password) => {
    const payload = {
      nombre_usuario: username,
      contrasena: password
    };
    return handleResponse(() => api.post(API_CONFIG.endpoints.auth.login, payload));
  },
  logout: () => handleResponse(() => api.post(API_CONFIG.endpoints.auth.logout)),
  refresh: () => handleResponse(() => api.post(API_CONFIG.endpoints.auth.refresh)),
  cambioContrasena: (actualContrasena, nuevaContrasena) => {
    const payload = {
      contrasena_actual: actualContrasena,
      contrasena_nueva: nuevaContrasena
    };
    return handleResponse(() => api.post(API_CONFIG.endpoints.auth.cambio_contrasena, payload));
  }
};

// Servicio de paquetes
export const paquetesService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.paquetes}/`)),
};

// Servicio de Autos
export const autosService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.autos}/`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.autos}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.autos}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.autos}/${id}`))
};

// Servicio de Bloques
export const bloquesService = {
  getSemanal: (semanaOffset = 0, alumnoId = null) => {
    const params = { semana: semanaOffset };
    if (alumnoId) params.id_alumno = alumnoId;
    return handleResponse(() => api.get(`${API_CONFIG.endpoints.bloques}/semanal`, { params }));
  }
};

// Servicio de Reservas
export const reservasService = {
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.reservas}/`, data)),
  delete: (data) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.reservas}/`, { data })),
  getByAlumno: (alumnoId, semanaOffset = null) => {
    const params = { id_alumno: alumnoId };
    if (semanaOffset !== null) params.semana = semanaOffset;
    return handleResponse(() => api.get(`${API_CONFIG.endpoints.reservas}/`, { params }));
  },
  getHoy: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.reservas}/hoy`)),
  getActuales: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.reservas}/actuales`)),
};

// Servicio de Asistencias
export const asistenciasService = {
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.asistencias}/`, data)),
  getMisAsistencias: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.asistencias}/`))
};

// Servicio de Tickets
export const ticketsService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.tickets}/`)),
  getByInstructor: (instructorId) => {
    const params = { id_instructor: instructorId };
    return handleResponse(() => api.get(`${API_CONFIG.endpoints.tickets}/`, { params }));
  },
};

// Servicio de Reportes
export const reportesService = {
  getDashboardAdmin: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.reportes}/admin-dashboard`)),
};