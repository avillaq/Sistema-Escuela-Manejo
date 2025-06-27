import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      id: null,
      token: null,
      rol: '',
      user: {
        nombre: '',
        apellidos: '',
        dni: '',
        telefono: '',
        email: '',
        activo: false
      },

      login: (data) => {
        set({
          isAuthenticated: true,
          id: data.user.id,
          rol: data.rol,
          token: data.access_token,
          user: {
            nombre: data.user.nombre,
            apellidos: data.user.apellidos,
            dni: data.user.dni,
            telefono: data.user.telefono,
            email: data.user.email,
            activo: data.user.activo
          }
        });
        localStorage.setItem('token', data.access_token);
      },
      logout: () => {
        set({
          isAuthenticated: false,
          id: null,
          rol: '',
          token: null,
          user: null
        });
        localStorage.removeItem('token');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        rol: state.rol,
        id: state.id,
        user: state.user
      })
    }
  )
);