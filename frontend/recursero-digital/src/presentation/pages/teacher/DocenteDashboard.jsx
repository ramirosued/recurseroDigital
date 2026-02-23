import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCourseDetails } from "../../../infrastructure/adapters/api/teacherApi";
import "../../styles/pages/docenteDashboard.css";

export default function DocenteDashboard() {
  const navigate = useNavigate();
  const [cursoActual, setCursoActual] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalEstudiantes: 0,
    juegosActivos: 0,
    progresoPromedio: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourseDetails = async () => {
      const cursoGuardado = localStorage.getItem('cursoSeleccionado');
      if (cursoGuardado) {
        const curso = JSON.parse(cursoGuardado);
        setCursoActual(curso);
        
        try {
          setLoading(true);
          setError(null);

          const courseDetails = await getMyCourseDetails(curso.id);
          
          if (courseDetails && courseDetails.statistics) {
            setEstadisticas(courseDetails.statistics);
          }
          
        } catch (error) {
          console.error('Error al cargar detalles del curso:', error);
          setError('Error al cargar los detalles del curso');
          setEstadisticas({
            totalEstudiantes: 0,
            juegosActivos: 0,
            progresoPromedio: 0
          });
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/docente');
      }
    };

    loadCourseDetails();
  }, [navigate]);

  const cambiarCurso = () => {
    localStorage.removeItem('cursoSeleccionado');
    navigate('/docente');
  };

  if (!cursoActual) {
    return <div className="loading">Cargando curso...</div>;
  }

  return (
    <div className="docente-dashboard">
      <div className="dashboard-header">
        <div className="curso-info">
          <div className="curso-badge" style={{ backgroundColor: cursoActual.color }}>
            {cursoActual.icono}
          </div>
          <div className="curso-details">
            <h1>{cursoActual.nombre}</h1>
            {loading && <span className="loading-indicator">🔄 Cargando estadísticas...</span>}
            {error && <span className="error-indicator">⚠️ {error}</span>}
          </div>
        </div>
        <button className="cambiar-curso-btn" onClick={cambiarCurso}>
          🔄 Cambiar Curso
        </button>
      </div>

      <div className="estadisticas-grid">
        <div className="inicio estudiantes">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{estadisticas.totalEstudiantes}</h3>
            <p>Estudiantes</p>
          </div>
        </div>

        <div className="inicio  juegos">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <h3>{estadisticas.juegosActivos}</h3>
            <p>Juegos Activos</p>
          </div>
        </div>

        <div className="inicio progreso">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{estadisticas.progresoPromedio}%</h3>
            <p>Progreso Promedio</p>
          </div>
        </div>
      </div>

      <div className="acciones-rapidas">
        <h2>🚀 Acciones Rápidas</h2>
        <div className="acciones-grid">
          <div className="accion-card" onClick={() => navigate('/docente/estudiantes')}>
            <div className="accion-icon">👨‍🎓</div>
            <h3>Ver Estudiantes</h3>
            <p>Gestiona el progreso de tus estudiantes</p>
          </div>

          <div className="accion-card" onClick={() => navigate('/docente/juegos')}>
            <div className="accion-icon">🎯</div>
            <h3>Configurar Juegos</h3>
            <p>Asigna y configura actividades</p>
          </div>

          <div className="accion-card" onClick={() => navigate('/docente/reportes')}>
            <div className="accion-icon">📊</div>
            <h3>Ver Reportes</h3>
            <p>Analiza el rendimiento del curso</p>
          </div>

          <div className="accion-card" onClick={() => navigate('/docente/estadisticas')}>
            <div className="accion-icon">📈</div>
            <h3>Estadísticas del Curso</h3>
            <p>Visualiza métricas y análisis detallados</p>
          </div>
        </div>
      </div>
    </div>
  );
}