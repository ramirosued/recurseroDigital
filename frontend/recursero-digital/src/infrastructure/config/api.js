export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const AUTH_ENDPOINTS = {
  LOGIN_STUDENT: '/login/student',
  LOGIN_TEACHER: '/login/teacher',
  LOGIN_ADMIN: '/login/admin',
  LOGOUT: '/logout'
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    const responseClone = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        const text = await responseClone.text();
        console.error('Respuesta del servidor (texto):', text);
        data = { error: 'Error al parsear la respuesta del servidor' };
      }
    } else {
      const text = await response.text();
      console.error('Respuesta no es JSON:', text);
      data = { error: 'La respuesta del servidor no es JSON válido' };
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
};
