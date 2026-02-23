import React, { useState, useEffect } from 'react';
import '../../styles/pages/adminAssignments.css';
import '../../styles/pages/addUserForm.css';
import { getAllCourses, getAllTeachers, getAllStudents, assignCourseToStudent, assignTeacherToCourses, getCourseStudents } from '../../services/adminService';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCourseStudentsModal, setShowCourseStudentsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]); // Para asignar múltiples cursos a un docente
  const [courseStudents, setCourseStudents] = useState([]);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [coursesData, teachersData, studentsData] = await Promise.all([
          getAllCourses(),
          getAllTeachers(),
          getAllStudents()
        ]);
        
        setCourses(coursesData);
        setTeachers(teachersData);
        const activeStudents = studentsData.filter(student =>
          student.enable !== false
        );
        setStudents(activeStudents);
        
        const assignmentsData = await Promise.all(
          coursesData.map(async (course) => {
            let studentsCount = 0;
            try {
              const courseStudents = await getCourseStudents(course.id);
              studentsCount = courseStudents.length;
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
            }
            
            const teacher = teachersData.find(t => {
              return course.teacherId && t.id === course.teacherId;
            });
            
            return {
              id: course.id,
              courseName: course.name,
              courseId: course.id,
              teacherName: teacher ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()) : 'Sin docente asignado',
              teacherId: course.teacherId || null,
              studentsCount,
              status: course.teacherId ? 'Activa' : 'Pendiente'
            };
          })
        );
        
        setAssignments(assignmentsData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar las asignaciones');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleOpenStudentModal = () => {
    setShowStudentModal(true);
  };

  const handleOpenTeacherModal = () => {
    setShowTeacherModal(true);
  };

  const handleCloseStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent('');
    setSelectedCourse('');
    setError(null);
  };

  const handleCloseTeacherModal = () => {
    setShowTeacherModal(false);
    setSelectedTeacher('');
    setSelectedCourses([]);
    setError(null);
  };

  const handleSubmitStudentAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedStudent || !selectedCourse) {
        setError('Debes seleccionar un estudiante y un curso');
        return;
      }
      
      await assignCourseToStudent({
        studentId: selectedStudent,
        courseId: selectedCourse
      });
      
      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      setCourses(coursesData);
      setTeachers(teachersData);
      
      const assignmentsData = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.length;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          
          return {
            id: course.id,
            courseName: course.name,
            courseId: course.id,
            teacherName: teacher ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()) : 'Sin docente asignado',
            teacherId: course.teacherId || null,
            studentsCount,
            status: course.teacherId ? 'Activa' : 'Pendiente'
          };
        })
      );
      
      setAssignments(assignmentsData);
      handleCloseStudentModal();
    } catch (err) {
      console.error('Error al asignar estudiante a curso:', err);
      setError(err.message || 'Error al asignar estudiante al curso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTeacherAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedTeacher || selectedCourses.length === 0) {
        setError('Debes seleccionar un docente y al menos un curso');
        return;
      }
      
      await assignTeacherToCourses({
        teacherId: selectedTeacher,
        courseIds: selectedCourses
      });
      
      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      setCourses(coursesData);
      setTeachers(teachersData);
      
      const assignmentsData = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.length;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          
          return {
            id: course.id,
            courseName: course.name,
            courseId: course.id,
            teacherName: teacher ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()) : 'Sin docente asignado',
            teacherId: course.teacherId || null,
            studentsCount,
            status: course.teacherId ? 'Activa' : 'Pendiente'
          };
        })
      );
      
      setAssignments(assignmentsData);
      handleCloseTeacherModal();
    } catch (err) {
      console.error('Error al asignar docente a cursos:', err);
      setError(err.message || 'Error al asignar docente a los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleViewCourseStudents = async (assignment) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCourseForStudents(assignment);
      
      const students = await getCourseStudents(assignment.courseId);
      setCourseStudents(Array.isArray(students) ? students : []);
      setShowCourseStudentsModal(true);
    } catch (err) {
      console.error('Error al cargar estudiantes del curso:', err);
      setError(err.message || 'Error al cargar estudiantes del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCourseStudentsModal = () => {
    setShowCourseStudentsModal(false);
    setCourseStudents([]);
    setSelectedCourseForStudents(null);
  };

  return (
    <div className="admin-assignments">
      <div className="assignments-header">
        <h1>Gestión de Asignaciones</h1>
        <div className="assignment-buttons">
          <button 
            className="add-assignment-btn student-btn" 
            onClick={handleOpenStudentModal}
            disabled={loading}
          >
            📚 Asignar Estudiante a Curso
          </button>
          <button 
            className="add-assignment-btn teacher-btn" 
            onClick={handleOpenTeacherModal}
            disabled={loading}
          >
            👨‍🏫 Asignar Docente a Cursos
          </button>
        </div>
      </div>

      {error && <div className="error-message-admin">{error}</div>}

      <div className="assignments-stats">
        <div className="stat-card-assignments">
          <h3>Total Asignaciones</h3>
          <div className="stat-numbers">{assignments.length}</div>
        </div>
        <div className="stat-card-assignments">
          <h3>Estudiantes Asignados</h3>
          <div className="stat-numbers">{assignments.reduce((acc, a) => acc + a.studentsCount, 0)}</div>
        </div>
        <div className="stat-card-assignments">
          <h3>Cursos Únicos</h3>
          <div className="stat-numbers">{new Set(assignments.map(a => a.courseName)).size}</div>
        </div>
      </div>

      <div className="assignments-content">
        <div className="assignments-filters">


        </div>

        <div className="assignments-table">
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Docente</th>
                <th>Estudiantes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>
                    <div className="course-info">
                      <strong>{assignment.courseName}</strong>
                    </div>
                  </td>
                  <td>{assignment.teacherName}</td>
                  <td>
                    <span className="students-count">{assignment.studentsCount}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="students-btn-asig"
                        onClick={() => handleViewCourseStudents(assignment)}
                        disabled={loading}
                      >
                        Estudiantes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
      </div>

      {/* Modal para asignar estudiante a curso */}
      {showStudentModal && (
        <div className="add-user-overlay" onClick={handleCloseStudentModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Asignar Estudiante a Curso</h2>
              <button className="close-btn" onClick={handleCloseStudentModal}>×</button>
            </div>
            
            <form className="user-form" onSubmit={(e) => { e.preventDefault(); handleSubmitStudentAssignment(); }}>
              {error && <div className="error-message-admin">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="student-select">Estudiante *</label>
                <select 
                  id="student-select"
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className={!selectedStudent && error ? "error" : ""}
                >
                  <option value="">Selecciona un estudiante</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.username})
                    </option>
                  ))}
                </select>
                {!selectedStudent && error && (
                  <span className="error-message">Debes seleccionar un estudiante</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="course-select">Curso *</label>
                <select 
                  id="course-select"
                  value={selectedCourse} 
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className={!selectedCourse && error ? "error" : ""}
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {!selectedCourse && error && (
                  <span className="error-message">Debes seleccionar un curso</span>
                )}
              </div>

              <div className="form-buttons">
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={handleCloseStudentModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Asignar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar docente a cursos */}
      {showTeacherModal && (
        <div className="add-user-overlay" onClick={handleCloseTeacherModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Asignar Docente a Cursos</h2>
              <button className="close-btn" onClick={handleCloseTeacherModal}>×</button>
            </div>
            
            <form className="user-form" onSubmit={(e) => { e.preventDefault(); handleSubmitTeacherAssignment(); }}>
              {error && <div className="error-message-admin">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="teacher-select">Docente *</label>
                <select 
                  id="teacher-select"
                  value={selectedTeacher} 
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className={!selectedTeacher && error ? "error" : ""}
                >
                  <option value="">Selecciona un docente</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || `${teacher.firstName} ${teacher.lastName}`} ({teacher.email})
                    </option>
                  ))}
                </select>
                {!selectedTeacher && error && (
                  <span className="error-message">Debes seleccionar un docente</span>
                )}
              </div>
              
              <div className="form-group">
                <label>Cursos (selecciona uno o más) *</label>
                <div className="courses-checkbox-list">
                  {courses.map(course => (
                    <label key={course.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                      />
                      {course.name}
                    </label>
                  ))}
                </div>
                {selectedCourses.length === 0 && error && (
                  <span className="error-message">Debes seleccionar al menos un curso</span>
                )}
                {selectedCourses.length > 0 && (
                  <p className="selected-count">
                    {selectedCourses.length} curso(s) seleccionado(s)
                  </p>
                )}
              </div>

              <div className="form-buttons">
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={handleCloseTeacherModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Asignar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver estudiantes del curso */}
      {showCourseStudentsModal && selectedCourseForStudents && (
        <div className="add-user-overlay" onClick={handleCloseCourseStudentsModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Estudiantes del Curso: {selectedCourseForStudents.courseName}</h2>
              <button className="close-btn" onClick={handleCloseCourseStudentsModal}>×</button>
            </div>
            
            <div className="user-form" style={{ padding: '2rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Cargando estudiantes...</p>
                </div>
              ) : courseStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No hay estudiantes asignados a este curso</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          background: '#f7fafc',
                          fontWeight: '600',
                          color: '#348267',
                          textTransform: 'uppercase',
                          fontSize: '0.875rem',
                          letterSpacing: '0.5px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>Nombre</th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          background: '#f7fafc',
                          fontWeight: '600',
                          color: '#348267',
                          textTransform: 'uppercase',
                          fontSize: '0.875rem',
                          letterSpacing: '0.5px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>Username</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map((student) => (
                        <tr key={student.id} style={{
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{
                            padding: '1rem',
                            textAlign: 'left',
                            color: 'black'
                          }}>
                            {student.name} {student.lastname}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'left',
                            color: 'black'
                          }}>
                            {student.userName || student.username}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-buttons" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={handleCloseCourseStudentsModal}
                  style={{ width: '100%' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
