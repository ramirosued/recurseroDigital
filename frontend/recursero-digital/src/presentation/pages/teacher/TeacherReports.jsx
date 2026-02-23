import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourseStudents } from "../../../infrastructure/adapters/api/teacherApi";
import "../../styles/pages/teacherReports.css";

export default function TeacherReports() {
  const navigate = useNavigate();
  const [cursoActual, setCursoActual] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const cursoGuardado = localStorage.getItem('cursoSeleccionado');
    if (cursoGuardado) {
      const curso = JSON.parse(cursoGuardado);
      setCursoActual(curso);
    } else {
      navigate('/docente');
    }
  }, [navigate]);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourseStudents(cursoActual.id);
        
        if (response.students && Array.isArray(response.students)) {
          const estudiantesFormateados = response.students.map(estudiante => ({
            id: estudiante.id,
            nombre: estudiante.firstName || estudiante.name || 'Sin nombre',
            apellido: estudiante.lastName || estudiante.surname || estudiante.lastname || 'Sin apellido',
            curso: cursoActual?.nombre || 'Sin curso asignado'
          }));
          
          setAlumnos(estudiantesFormateados);
        } else {
          setAlumnos([]);
        }
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        setError('No se pudieron cargar los estudiantes del curso. Verifica tu conexión.');
        setAlumnos([]);
      } finally {
        setLoading(false);
      }
    };

    if (cursoActual && cursoActual.id) {
      cargarEstudiantes();
    }
  }, [cursoActual]);

  const handleVerReporte = (alumnoId) => {
    navigate(`/reportes/${alumnoId}`);
  };

  const handleVolver = () => {
    navigate('/docente/dashboard');
  };

  if (!cursoActual || loading) {
    return (
      <div className="teacher-reports-container">
        <button className="reports-back-button" onClick={handleVolver}>
          ← Volver al Dashboard
        </button>
        <div className="teacher-reports-wrapper">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{!cursoActual ? 'Cargando curso...' : 'Cargando estudiantes...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-reports-container">
      <button className="reports-back-button" onClick={handleVolver}>
        ← Volver al Dashboard
      </button>
      <div className="teacher-reports-wrapper">
        <div className="teacher-reports-header">
          <h1>Reportes de Estudiantes - {cursoActual.nombre}</h1>
          <p>Consulta el progreso y rendimiento de tus alumnos</p>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="btn-reintentar" 
              onClick={() => window.location.reload()}
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        <div className="alumnos-table-container">
          <table className="alumnos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Curso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                  <td>{alumno.nombre}</td>
                  <td>{alumno.apellido}</td>
                  <td>{alumno.curso}</td>
                  <td>
                    <button 
                      className="btn-ver-reporte"
                      onClick={() => handleVerReporte(alumno.id)}
                    >
                      📊 Ver reporte
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!error && alumnos.length === 0 && (
          <div className="no-alumnos">
            <p>No hay alumnos registrados en este curso</p>
          </div>
        )}
      </div>
    </div>
  );
}
