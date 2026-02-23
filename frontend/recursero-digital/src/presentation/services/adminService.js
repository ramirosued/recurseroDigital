import { API_BASE_URL } from '../../infrastructure/config/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const createStudent = async ({ nombre, apellido, username, password, dni }) => {
  const response = await fetch(`${API_BASE_URL}/student`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: nombre,
      lastName: apellido,
      username,
      password,
      dni
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al crear estudiante');
  }
  return data;
};

export const createCourse = async ({ name }) => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al crear curso');
  }
  return data;
};

export const getAllStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/student`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener estudiantes');
  }
  return data.students || [];
};

export const getAllTeachers = async () => {
  const response = await fetch(`${API_BASE_URL}/teacher`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener docentes');
  }
  return data.teachers || [];
};

export const getAllCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener cursos');
  }
  return data.courses || [];
};

export const createTeacher = async ({ nombre, apellido, email, username, password }) => {
  const response = await fetch(`${API_BASE_URL}/teacher`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: nombre,
      surname: apellido,
      email,
      username,
      password
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al crear docente');
  }
  return data;
};

export const assignCourseToStudent = async ({ studentId, courseId }) => {
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/courses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ courseId })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al asignar curso');
  }
  return data;
};

export const assignTeacherToCourses = async ({ teacherId, courseIds }) => {
  const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}/courses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ courseIds })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al asignar docente a cursos');
  }
  return data;
};

export const getCourseStudents = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/students`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener estudiantes del curso');
  }
  return data.students || [];
};

export const updateCourse = async ({ courseId, name }) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar curso');
  }
  return data.course;
};

export const deleteCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al eliminar curso');
  }
  return data;
};

export const updateStudent = async ({ studentId, name, lastname, username, password, courseId }) => {
  const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name, lastname, username, password, courseId })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar estudiante');
  }
  return data.student;
};

export const deleteStudent = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al deshabilitar estudiante');
  }
  return data;
};

export const enableStudent = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/enable`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al reactivar estudiante');
  }
  return data;
};

export const updateTeacher = async ({ teacherId, name, surname, username, email, password, courseIds }) => {
  const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name, surname, username, email, password, courseIds })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar docente');
  }
  return data.teacher;
};

export const deleteTeacher = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al deshabilitar docente');
  }
  return data;
};

export const enableTeacher = async (teacherId) => {
  const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}/enable`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al reactivar docente');
  }
  return data;
};

export const bulkUploadStudents = async (studentsData) => {
  if (studentsData.length > 100) {
    throw new Error('No se pueden cargar más de 100 estudiantes a la vez');
  }
  
  let createdCount = 0;
  let errorCount = 0;
  const errorDetails = [];

  for (const [index, studentData] of studentsData.entries()) {
    try {
      await createStudent({
        nombre: studentData.nombre,
        apellido: studentData.apellido,
        username: studentData.username,
        password: studentData.password,
        dni: studentData.dni
      });
      createdCount++;
    } catch (error) {
      errorCount++;
      errorDetails.push(`Estudiante ${index + 1} (${studentData.username}): ${error.message}`);
    }
  }

  return {
    message: `Carga masiva completada: ${createdCount} estudiantes creados, ${errorCount} errores`,
    created: createdCount,
    errors: errorCount,
    errorDetails: errorDetails.length > 0 ? errorDetails : undefined
  };
};


