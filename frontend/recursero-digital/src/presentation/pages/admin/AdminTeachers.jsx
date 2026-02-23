import React, { useState, useMemo } from 'react';
import '../../styles/pages/adminTeachers.css';

export default function AdminTeachers({ teachers = [], onEdit, onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = searchTerm === '' ||
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [teachers, searchTerm]);

  if (!teachers || teachers.length === 0) {
    return (
      <div className="admin-teachers">
        <p>No hay docentes registrados</p>
      </div>
    );
  }

  return (
    <div className="admin-teachers">

      <div className="teachers-content">
        <div className="teachers-filters">
          <div className="filter-group">
            <label>Buscar docente:</label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="teachers-grid">
          {filteredTeachers.length === 0 ? (
            <p className="no-results">No se encontraron docentes con los criterios de búsqueda</p>
          ) : (
            filteredTeachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-header">
                  <h3>{teacher.name}</h3>
                </div>
                <div className="teacher-info">
                  <p><strong>Email:</strong> {teacher.email}</p>
                  <p><strong>Username:</strong> {teacher.username}</p>
                  <div className="teacher-metrics">
                    <div className="metric">
                      <span className="metric-value">{teacher.courses?.length || 0}</span>
                      <span className="metric-label">Cursos</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{teacher.students?.length || 0}</span>
                      <span className="metric-label">Estudiantes</span>
                    </div>
                  </div>
                </div>
                <div className="teacher-actions">
                  <button 
                    className="edit-boton" 
                    onClick={() => onEdit && onEdit(teacher)}
                  >
                    Editar
                  </button>
                  <button 
                    className={teacher.enable === false ? "activate-boton" : "delete-boton"} 
                    onClick={() => onToggleStatus && onToggleStatus(teacher)}
                  >
                    {teacher.enable === false ? "Activar" : "Desactivar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}