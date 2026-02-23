import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourseStatistics, getCourseStudents } from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/components/DashboardStats.css';

const DashboardStats = ({ courseId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateTotalProgress = (student) => {
    if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) {
      return 0;
    }
    const progressValues = Object.values(student.progressByGame).map(game => game.averageScore || 0);
    const sum = progressValues.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / progressValues.length);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching statistics for courseId:', courseId);
        
        const [statisticsData, studentsData] = await Promise.all([
          getCourseStatistics(courseId),
          getCourseStudents(courseId)
        ]);
        
        console.log('Statistics data received:', statisticsData);
        console.log('Students data received:', studentsData);
        
        setStats({
          courseStats: {
            totalStudents: statisticsData.totalStudents || 0,
            progressByGame: statisticsData.progressByGame || []
          }
        });
        
        setStudents(studentsData.students || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading stats:', error);
        console.error('Error details:', {
          message: error?.message,
          error: error?.error,
          response: error?.response
        });
        const errorMessage = error?.message || error?.error || 'Error al cargar las estadísticas';
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (courseId) {
      fetchStats();
    } else {
      setError('No se ha seleccionado un curso');
      setLoading(false);
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="dashboard-stats loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-stats error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="dashboard-stats">No hay datos disponibles</div>;
  }

  const { courseStats } = stats;

  const gameNames = {
    ordenamiento: 'Ordenamiento',
    escritura: 'Escritura',
    descomposicion: 'Descomposición',
    escala: 'Escala Numérica',
    calculos: 'Cálculos'
  };

  const calculateCourseAverageProgress = () => {
    if (students.length === 0) {
      return 0;
    }
    const totalProgress = students.reduce((sum, student) => {
      const studentProgress = calculateTotalProgress(student);
      return sum + studentProgress;
    }, 0);
    return Math.round(totalProgress / students.length);
  };

  const courseAverageProgress = calculateCourseAverageProgress();

  const calculateTotalAttempts = (student) => {
    if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) {
      return 0;
    }
    return Object.values(student.progressByGame).reduce((sum, game) => sum + (game.totalAttempts || 0), 0);
  };

  const calculateTotalTime = (student) => {
    if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) {
      return 0;
    }
    return Object.values(student.progressByGame).reduce((sum, game) => sum + (game.totalTime || 0), 0);
  };

  // Top 5 estudiantes con criterios de desempate
  const topStudents = [...students]
    .map(student => ({
      ...student,
      totalProgress: calculateTotalProgress(student),
      totalAttempts: calculateTotalAttempts(student),
      totalTime: calculateTotalTime(student)
    }))
    .sort((a, b) => {
      if (b.totalProgress !== a.totalProgress) {
        return b.totalProgress - a.totalProgress;
      }
      if (a.totalAttempts !== b.totalAttempts) {
        return a.totalAttempts - b.totalAttempts;
      }
      return a.totalTime - b.totalTime;
    })
    .slice(0, 5);

  // Estudiantes que necesitan refuerzo (menor progreso)
  const studentsNeedingSupport = [...students]
    .map(student => ({
      ...student,
      totalProgress: calculateTotalProgress(student),
      totalAttempts: calculateTotalAttempts(student),
      totalTime: calculateTotalTime(student)
    }))
    .sort((a, b) => {
      if (a.totalProgress !== b.totalProgress) {
        return a.totalProgress - b.totalProgress;
      }
      if (b.totalAttempts !== a.totalAttempts) {
        return b.totalAttempts - a.totalAttempts;
      }
      return b.totalTime - a.totalTime;
    })
    .slice(0, 5);

  // Actividades con mayor dificultad (promedio de reintentos por juego)
  const gameDifficulty = {};
  students.forEach(student => {
    if (student.progressByGame) {
      Object.entries(student.progressByGame).forEach(([gameId, progress]) => {
        if (!gameDifficulty[gameId]) {
          gameDifficulty[gameId] = { totalAttempts: 0, studentsCount: 0, totalCompleted: 0 };
        }
        gameDifficulty[gameId].totalAttempts += progress.totalAttempts || 0;
        gameDifficulty[gameId].studentsCount += progress.totalAttempts > 0 ? 1 : 0;
        gameDifficulty[gameId].totalCompleted += progress.completed || 0;
      });
    }
  });

  const difficultyRanking = Object.entries(gameDifficulty)
    .map(([gameId, data]) => ({
      gameId,
      gameName: gameNames[gameId] || gameId,
      averageAttempts: data.studentsCount > 0 
        ? Math.round(data.totalAttempts / data.studentsCount) 
        : 0,
      totalAttempts: data.totalAttempts,
      totalCompleted: data.totalCompleted,
      studentsWithAttempts: data.studentsCount
    }))
    .filter(game => game.totalAttempts > 0)
    .sort((a, b) => b.averageAttempts - a.averageAttempts);

  // Métricas de tiempo por juego
  const gameTimeMetrics = {};
  students.forEach(student => {
    if (student.progressByGame) {
      Object.entries(student.progressByGame).forEach(([gameId, progress]) => {
        if (!gameTimeMetrics[gameId]) {
          gameTimeMetrics[gameId] = { totalTime: 0, studentsCount: 0, completed: 0 };
        }
        gameTimeMetrics[gameId].totalTime += progress.totalTime || 0;
        if (progress.totalTime > 0) {
          gameTimeMetrics[gameId].studentsCount++;
        }
        gameTimeMetrics[gameId].completed += progress.completed || 0;
      });
    }
  });

  const timeMetricsRanking = Object.entries(gameTimeMetrics)
    .map(([gameId, data]) => ({
      gameId,
      gameName: gameNames[gameId] || gameId,
      averageTime: data.studentsCount > 0 
        ? Math.round(data.totalTime / data.studentsCount) 
        : 0,
      totalTime: data.totalTime,
      totalTimeMinutes: Math.round(data.totalTime / 60),
      averageTimeMinutes: data.studentsCount > 0 
        ? Math.round(data.totalTime / data.studentsCount / 60) 
        : 0,
      completed: data.completed
    }))
    .filter(game => game.totalTime > 0)
    .sort((a, b) => b.totalTime - a.totalTime);

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h2>📊 Estadísticas del Curso</h2>
        <p>Resumen general del desempeño de tus estudiantes</p>
      </div>

      <div className="main-metrics">
        <div className="metric-card students">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{courseStats.totalStudents}</h3>
            <p>Estudiantes totales</p>
          </div>
        </div>
        <div className="metric-card average-score">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>{courseAverageProgress}%</h3>
            <p>Progreso promedio del curso</p>
          </div>
        </div>
      </div>

      <div className="games-distribution">
        <h3>🎮 Progreso del Curso por Juego</h3>
        <div className="games-chart">
          {courseStats.progressByGame && courseStats.progressByGame.length > 0 ? (
            courseStats.progressByGame.map((gameProgress) => {
              const gameName = gameNames[gameProgress.gameId] || gameProgress.gameId;
              const percentage = gameProgress.averageProgress || 0;

              return (
                <div key={gameProgress.gameId} className="game-bar">
                  <div className="game-info">
                    <span className="game-name">{gameName}</span>
                    <span className="game-count">
                      {gameProgress.studentsWithProgress || 0}/{gameProgress.totalStudents || 0} estudiantes
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${gameProgress.gameId}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="percentage">{percentage}%</span>
                </div>
              );
            })
          ) : (
            <div className="no-data">
              <p>No hay datos de progreso disponibles para este curso</p>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Estudiantes */}
      {topStudents.length > 0 && (
        <div className="top-students-section">
          <h3>🏆 Top 5 Estudiantes</h3>
          <div className="top-students-chart">
            {topStudents.map((student, index) => {
              const progressPercentage = student.totalProgress;

              return (
                <div key={student.id} className="top-student-bar-container">
                  <div className="student-bar-info">
                    <div className="student-rank-number">#{index + 1}</div>
                    <div className="student-name-info">
                      <span className="student-full-name">{student.name} {student.lastname}</span>
                      <span className="student-username">@{student.userName}</span>
                    </div>
                  </div>
                  <div className="vertical-bar-wrapper">
                    <div className="vertical-bar-container">
                      <div 
                        className="vertical-bar-fill estudiante"
                        style={{ height: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="vertical-bar-percentage">{progressPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estudiantes que Necesitan Refuerzo */}
      {studentsNeedingSupport.length > 0 && (
        <div className="support-needed-section">
          <h3>📚 Estudiantes que Necesitan Refuerzo</h3>
          <p className="section-description">Estudiantes con menor progreso que requieren atención adicional</p>
          <div className="top-students-chart">
            {studentsNeedingSupport.map((student, index) => {
              const progressPercentage = student.totalProgress;

              return (
                <div key={student.id} className="top-student-bar-container">
                  <div className="student-bar-info">
                    <div className="student-rank-number support">{index + 1}</div>
                    <div className="student-name-info">
                      <span className="student-full-name">{student.name} {student.lastname}</span>
                      <span className="student-username">@{student.userName}</span>
                    </div>
                  </div>
                  <div className="vertical-bar-wrapper">
                    <div className="vertical-bar-container">
                      <div 
                        className="vertical-bar-fill support-needed"
                        style={{ height: `${Math.max(progressPercentage, 5)}%` }}
                      ></div>
                    </div>
                    <span className="vertical-bar-percentage">{progressPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actividades con Mayor Dificultad */}
      {difficultyRanking.length > 0 && (
        <div className="difficulty-section">
          <h3>⚠️ Actividades con Mayor Dificultad</h3>
          <p className="section-description">Juegos ordenados por promedio de reintentos (mayor dificultad = más reintentos)</p>
          <div className="difficulty-badges-grid">
            {difficultyRanking.map((game, index) => {
              const maxAttempts = Math.max(...difficultyRanking.map(g => g.averageAttempts), 1);
              const sizePercentage = Math.max((game.averageAttempts / maxAttempts) * 100, 20);

              return (
                <div key={game.gameId} className="difficulty-badge-card">
                  <div className="badge-rank">#{index + 1}</div>
                  <div 
                    className={`difficulty-badge-circle ${game.gameId}`}
                    style={{ 
                      width: `${60 + (sizePercentage * 0.4)}px`,
                      height: `${60 + (sizePercentage * 0.4)}px`,
                      fontSize: `${16 + (sizePercentage * 0.08)}px`
                    }}
                  >
                    <span className="badge-value">{game.averageAttempts}</span>
                    <span className="badge-label">reintentos</span>
                  </div>
                  <div className="badge-game-info">
                    <h4 className="badge-game-name">{game.gameName}</h4>
                    <p className="badge-game-stats">
                      {game.studentsWithAttempts} estudiantes · {game.totalCompleted} completadas
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Métricas de Tiempo */}
      {timeMetricsRanking.length > 0 && (
        <div className="time-metrics-section">
          <h3>⏱️ Métricas de Tiempo</h3>
          <p className="section-description">Tiempo invertido por juego (ordenado por tiempo total)</p>
          <div className="time-gauge-grid">
            {timeMetricsRanking.map((game) => {
              const maxTime = Math.max(...timeMetricsRanking.map(g => g.totalTimeMinutes), 1);
              const percentage = Math.min((game.totalTimeMinutes / maxTime) * 100, 100);
              // Longitud aproximada del arco semicircular (π * radio = 3.14159 * 50 ≈ 157)
              const arcLength = 157.08;
              const filledLength = (percentage / 100) * arcLength;

              return (
                <div key={game.gameId} className="time-gauge-card">
                  <div className="gauge-container">
                    <svg className="gauge-svg" viewBox="0 0 120 80">
                      <defs>
                        <linearGradient id={`gauge-gradient-${game.gameId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={game.gameId === 'ordenamiento' ? '#3b82f6' : 
                                                       game.gameId === 'escritura' ? '#10b981' : 
                                                       game.gameId === 'descomposicion' ? '#f59e0b' : 
                                                       game.gameId === 'escala' ? '#8b5cf6' : '#ec4899'} />
                          <stop offset="100%" stopColor={game.gameId === 'ordenamiento' ? '#1d4ed8' : 
                                                         game.gameId === 'escritura' ? '#059669' : 
                                                         game.gameId === 'descomposicion' ? '#d97706' : 
                                                         game.gameId === 'escala' ? '#7c3aed' : '#db2777'} />
                        </linearGradient>
                      </defs>
                      {/* Fondo del gauge */}
                      <path
                        d="M 10 70 A 50 50 0 0 1 110 70"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Barra del gauge */}
                      <path
                        d="M 10 70 A 50 50 0 0 1 110 70"
                        fill="none"
                        stroke={`url(#gauge-gradient-${game.gameId})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${filledLength} ${arcLength}`}
                        strokeDashoffset="0"
                        className={`gauge-stroke ${game.gameId}`}
                      />
                    </svg>
                    <div className="gauge-content">
                      <span className="gauge-value">{game.totalTimeMinutes}m</span>
                      <span className="gauge-label">total</span>
                    </div>
                  </div>
                  <div className="gauge-game-info">
                    <h4 className="gauge-game-name">{game.gameName}</h4>
                    <div className="gauge-stats">
                      <span className="gauge-stat-item">
                        <span className="stat-label">Promedio:</span>
                        <span className="stat-value">{game.averageTimeMinutes}m</span>
                      </span>
                      <span className="gauge-stat-item">
                        <span className="stat-label">Completadas:</span>
                        <span className="stat-value">{game.completed}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default DashboardStats;