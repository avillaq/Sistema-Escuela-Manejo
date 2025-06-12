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
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.alumnos)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.alumnos}/${id}`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.alumnos}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.alumnos}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.alumnos}/${id}`)),
  getActivos: () => handleResponse(() => api.get(API_CONFIG.endpoints.alumnos, { params: { activo: true } }))
};

// Servicio de instructores
export const instructoresService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.instructores)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.instructores}/${id}`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.instructores}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.instructores}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.instructores}/${id}`)),
  getActivos: () => handleResponse(() => api.get(API_CONFIG.endpoints.instructores, { params: { activo: true } }))
};

// Servicio de administradores
export const administradoresService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.administradores)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.administradores}/${id}`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.administradores}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.administradores}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.administradores}/${id}`))
};

// Servicio de matrículas
export const matriculasService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.matriculas)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.matriculas}/${id}`)),
  create: (data) => {
    const payload = {
      id_alumno: data.alumno.id,
      categoria: data.categoria,
      tipo_contratacion: data.tipo_contratacion,
      ...(data.tipo_contratacion === 'paquete' 
        ? { id_paquete: data.paquete.id }
        : { 
            horas_contratadas: parseInt(data.horas_contratadas),
            tarifa_por_hora: parseFloat(data.tarifa_por_hora)
          }
      ),
      monto_pago_inicial: parseFloat(data.monto_pago)
    };
    return handleResponse(() => api.post(API_CONFIG.endpoints.matriculas, payload));
  },
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.matriculas}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.matriculas}/${id}`)),
  getByAlumno: (alumnoId) => handleResponse(() => api.get(API_CONFIG.endpoints.matriculas, { params: { id_alumno: alumnoId } }))
};

// Servicio de pagos
export const pagosService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.pagos)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.pagos}/${id}`)),
  create: (data) => {
    const payload = {
      id_matricula: data.id_matricula,
      monto: parseFloat(data.monto)
    };
    return handleResponse(() => api.post(API_CONFIG.endpoints.pagos, payload));
  },
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.pagos}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.pagos}/${id}`)),
  getByMatricula: (matriculaId) => handleResponse(() => api.get(API_CONFIG.endpoints.pagos, { params: { id_matricula: matriculaId } }))
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
  getCurrentUser: () => handleResponse(() => api.get(API_CONFIG.endpoints.auth.me))
};

// Servicio de paquetes
export const paquetesService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.paquetes)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.paquetes}/${id}`)),
  create: (data) => handleResponse(() => api.post(`${API_CONFIG.endpoints.paquetes}/`, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.paquetes}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.paquetes}/${id}`))
};

// Mas servicios que se implementar despues
export const autosService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.autos)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.autos}/${id}`)),
  create: (data) => handleResponse(() => api.post(API_CONFIG.endpoints.autos, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.autos}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.autos}/${id}`))
};

export const reservasService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.reservas)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.reservas}/${id}`)),
  create: (data) => handleResponse(() => api.post(API_CONFIG.endpoints.reservas, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.reservas}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.reservas}/${id}`))
};

export const ticketsService = {
  getAll: () => handleResponse(() => api.get(API_CONFIG.endpoints.tickets)),
  getById: (id) => handleResponse(() => api.get(`${API_CONFIG.endpoints.tickets}/${id}`)),
  create: (data) => handleResponse(() => api.post(API_CONFIG.endpoints.tickets, data)),
  update: (id, data) => handleResponse(() => api.put(`${API_CONFIG.endpoints.tickets}/${id}`, data)),
  delete: (id) => handleResponse(() => api.delete(`${API_CONFIG.endpoints.tickets}/${id}`))
};