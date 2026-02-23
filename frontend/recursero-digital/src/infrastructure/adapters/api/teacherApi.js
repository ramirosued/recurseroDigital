import { API_BASE_URL } from '../../config/api';

export const getTeacherProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getTeacherCourses = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getMyCourseDetails = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseStudents = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseGames = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Error al obtener juegos del curso: ${response.statusText}`);
  }
  return await response.json();
};

export const updateCourseGameStatus = async (courseGameId, isEnabled) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/games/${courseGameId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isEnabled })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Error al actualizar estado del juego: ${response.statusText}`);
  }
  return await response.json();
};

export const getStudentDetails = async (studentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/details`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseStatistics = async (courseId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText || 'Error desconocido' };
    }
    
    const errorMessage = errorData.error || errorData.message || `Error al obtener estadísticas: ${response.status} ${response.statusText}`;
    console.error('Error en getCourseStatistics:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

export const getGameReports = async (courseId, gameType) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games/${gameType}/reports`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getGameCommonErrors = async (courseId, gameType) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games/${gameType}/common-errors`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getActivityConfig = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/activity-config`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const updateActivityConfig = async (courseId, config) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/activity-config`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  return await response.json();
};

export const getCourseGrades = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/grades`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const updateStudentGrade = async (studentId, gradeData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/grade`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gradeData)
  });
  return await response.json();
};


export const exportCourseData = async (courseId, format = 'csv') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/export?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  return response.blob();
};

export const MOCK_DATA = {
  teacherProfile: {
    id: "teacher_1",
    name: "María González",
    email: "maria.gonzalez@school.edu",
    courses: ["Matemática 3º", "Matemática 4º"]
  },
  
  courseStats: {
    totalStudents: 25,
    activeStudents: 22,
    averageCourseScore: 84,
    totalGamesPlayed: 450,
    gamesDistribution: {
      ordenamiento: 150,
      escritura: 120,
      descomposicion: 100,
      escala: 80
    }
  },
  
  sampleStudent: {
    id: "student_1",
    name: "Juan Pérez",
    email: "juan.perez@student.edu",
    totalGamesPlayed: 25,
    averageScore: 85,
    lastActivity: "2024-10-12T10:30:00Z",
    progressByGame: {
      ordenamiento: { completed: 10, totalTime: 450, averageScore: 88 },
      escritura: { completed: 8, totalTime: 320, averageScore: 82 },
      descomposicion: { completed: 5, totalTime: 200, averageScore: 90 },
      escala: { completed: 2, totalTime: 100, averageScore: 75 }
    }
  }
};