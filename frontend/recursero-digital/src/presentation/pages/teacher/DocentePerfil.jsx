import React, { useMemo } from "react";
import "../../styles/pages/perfilDocente.css";

export default function PerfilDocente() {
  const teacherNameOrEmail = useMemo(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    if (storedName) return storedName.toUpperCase();
    if (storedEmail) {
      const nameFromEmail = storedEmail.split("@")[0];
      return nameFromEmail.toUpperCase();
    }
    return "DOCENTE";
  }, []);

  const teacherData = {
    name: teacherNameOrEmail,
    experience: 3,
    totalStudents: 45,
    coursesManaged: 8,
    stats: {
      activeStudents: 42,
      completedAssignments: 156,
      avgStudentScore: "87%",
      classesCreated: 24,
    }
  };

  return (
    <div className="perfil-docente">
      <div className="teacher-info">
        <h1 className="teacher-name">{teacherData.name}</h1>
        <h2 className="section-title">Resumen de Actividad</h2>
      </div>

      <div className="stats-overview">
        <div className="overview-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{teacherData.totalStudents}</div>
            <div className="stat-label">Estudiantes Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-number">{teacherData.coursesManaged}</div>
            <div className="stat-label">Cursos Gestionados</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{teacherData.stats.completedAssignments}</div>
            <div className="stat-label">Tareas Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{teacherData.stats.avgStudentScore}</div>
            <div className="stat-label">Promedio Estudiantes</div>
          </div>
        </div>
      </div>

      <div className="teaching-analytics">
        <h2 className="section-title">Análisis de Enseñanza</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Estudiantes Activos</h3>
            <div className="analytics-chart">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(teacherData.stats.activeStudents / teacherData.totalStudents) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {teacherData.stats.activeStudents}/{teacherData.totalStudents} estudiantes
              </span>
            </div>
          </div>
          
          <div className="analytics-card">
            <h3>Clases Creadas</h3>
            <div className="analytics-number">
              <span className="big-number">{teacherData.stats.classesCreated}</span>
              <span className="number-label">clases totales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
