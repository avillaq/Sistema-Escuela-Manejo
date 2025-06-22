import { api } from "@/service/axiosInstance";
import { API_CONFIG } from "@/config/api.config";

// Funcion adicional para manejar respuestas
const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.mensaje || error.message,
      status: error.response?.status,
      validationErrors: error.response?.data
    };
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
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.matriculas}/${id}`)),
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
      contraseña: password
    };
    return handleResponse(() => api.post(API_CONFIG.endpoints.auth.login, payload));
  },
  logout: () => handleResponse(() => api.post(API_CONFIG.endpoints.auth.logout)),
  getCurrentUser: () => handleResponse(() => api.get(API_CONFIG.endpoints.auth.me))
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
};

// Servicio de Asistencias
export const asistenciasService = {
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.asistencias}/`, data)),
};

// Servicio de Tickets
export const ticketsService = {
  getAll: () => handleResponse(() => api.get(`${API_CONFIG.endpoints.tickets}/`)),
  getByInstructor: (instructorId) => handleResponse(() => api.get(`${API_CONFIG.endpoints.tickets}/${instructorId}`)),
};