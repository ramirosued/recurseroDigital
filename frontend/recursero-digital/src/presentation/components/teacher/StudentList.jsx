import React, { useState, useEffect } from 'react';
import { getCourseStudents } from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/components/StudentList.css';

const StudentList = ({ courseId, onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getCourseStudents(courseId);
        
        if (response.students) {
          setStudents(response.students);
        } else {
          setStudents([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Error al cargar la lista de estudiantes');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getDaysSinceLastActivity = (dateString) => {
    const lastActivity = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - lastActivity);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'needs-improvement';
  };

  const sortedStudents = [...students].sort((a, b) => {
    const fullNameA = `${a.name} ${a.lastname}`;
    const fullNameB = `${b.name} ${b.lastname}`;
    return fullNameA.localeCompare(fullNameB);
  });

  if (loading) {
    return (
      <div className="student-list loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-list error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  const calculateTotalProgress = (student) => {
    if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) {
      return 0;
    }
    const progressValues = Object.values(student.progressByGame).map(game => game.averageScore || 0);
    const sum = progressValues.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / progressValues.length);
  };

  const totalStudents = students.length;
  const courseGeneralProgress = students.length > 0
    ? Math.round(
        students.reduce((sum, student) => {
          const studentProgress = calculateTotalProgress(student);
          return sum + studentProgress;
        }, 0) / students.length
      )
    : 0;

  return (
    <div className="lista-alumno">
      <div className="list-header">
        <h2>👥 Lista de Estudiantes</h2>
        <p>Gestiona y revisa el progreso de tus estudiantes</p>
      </div>

      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-value">{totalStudents}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{courseGeneralProgress}%</span>
          <span className="stat-label">Progreso general curso</span>
        </div>
      </div>

      <div className="students-grid">
        {sortedStudents.length === 0 ? (
          <div className="no-students">
            <p>No se encontraron estudiantes con los filtros aplicados</p>
          </div>
        ) : (
          sortedStudents.map((student) => {
            const scoreColor = getScoreColor(student.averageScore);

            return (
              <div 
                key={student.id} 
                className="student-card"
                onClick={() => onSelectStudent && onSelectStudent(student)}
              >
                <div className="student-header">
                  <div className="student-avatar">
                    {`${student.name[0]}${student.lastname[0]}`}
                  </div>
                  <div className="student-info">
                    <h3 className="student-name">{student.name} {student.lastname}</h3>
                    <p className="student-username">@{student.userName}</p>
                    <p className="enrollment-date">
                      Inscripto: {formatDate(student.enrollmentDate)}
                    </p>
                  </div>
                </div>

                <div className="student-stats">
                  <div className="stat-group">
                    <div className="stat">
                      <span className="stat-label">Juegos</span>
                      <span className="stat-value">{student.totalGamesPlayed}</span>
                    </div>
                    {(() => {
                      const calculateTotalProgress = () => {
                        if (!student.progressByGame || Object.keys(student.progressByGame).length === 0) {
                          return 0;
                        }
                        const progressValues = Object.values(student.progressByGame).map(game => game.averageScore || 0);
                        const sum = progressValues.reduce((acc, val) => acc + val, 0);
                        return Math.round(sum / progressValues.length);
                      };
                      const totalProgress = calculateTotalProgress();
                      const progressColor = getScoreColor(totalProgress);
                      return (
                        <div className="stat">
                          <span className="stat-label">Progreso total</span>
                          <span className={`stat-value score-${progressColor}`}>
                            {totalProgress}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="games-progress">
                  {Object.entries(student.progressByGame).map(([game, progress]) => {
                    const gameNames = {
                      ordenamiento: 'Ordenamiento',
                      escritura: 'Escritura',
                      descomposicion: 'Descomposición', 
                      escala: 'Escala',
                      calculos: 'Cálculos'
                    };

                    return (
                      <div key={game} className="game-progress">
                        <div className="game-progress-header">
                          <span className="game-name">{gameNames[game] || game.charAt(0).toUpperCase() + game.slice(1)}</span>
                          <span className="game-score">{progress.averageScore}%</span>
                        </div>
                        <div className="game-progress-bar">
                          <div 
                            className={`name-games ${game}`}
                            style={{ width: `${Math.min(progress.averageScore, 100)}%` }}
                          ></div>
                        </div>
                        <div className="game-details">
                          <span>{progress.completed} completados</span>
                          <span>{Math.round(progress.totalTime / 60)}min total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="student-actions">
                  <button className="action-btn view-profile">
                    Ver Perfil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentList;