import React, { useEffect, useState } from 'react';
import '../../styles/pages/adminCourses.css';
import { createCourse, getAllCourses, updateCourse, deleteCourse, getAllTeachers, getCourseStudents } from '../../services/adminService';
import AddCourseForm from './AddCourseForm';
import EditCourseForm from './EditCourseForm';
import DeleteCourseForm from './DeleteCourseForm';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [showDeleteCourseForm, setShowDeleteCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [coursesData, teachersData] = await Promise.all([
          getAllCourses(),
          getAllTeachers()
        ]);
        
        const coursesWithDetails = await Promise.all(
          coursesData.map(async (course) => {
            let studentsCount = 0;
            try {
              const courseStudents = await getCourseStudents(course.id);
              studentsCount = courseStudents ? courseStudents.length : 0;
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
              studentsCount = 0;
            }
            
            const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
            const teacherName = teacher 
              ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
              : 'Sin docente asignado';
            
            return {
              id: course.id,
              name: course.name,
              teacher: teacherName,
              students: studentsCount,
              status: 'Activo',
            };
          })
        );
        
        setCourses(coursesWithDetails);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('No se pudieron cargar los cursos');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleAddCourse = () => {
    setShowAddCourseForm(true);
  };

  const handleCloseForm = () => {
    setShowAddCourseForm(false);
    setShowEditCourseForm(false);
    setShowDeleteCourseForm(false);
    setSelectedCourse(null);
  };

  const handleCreateCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      await createCourse({ name: courseData.name });

      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      const coursesWithDetails = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.students ? courseStudents.students.length : 0;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          const teacherName = teacher 
            ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
            : 'Sin docente asignado';
          
          return {
            id: course.id,
            name: course.name,
            teacher: teacherName,
            students: studentsCount,
            status: 'Activo',
          };
        })
      );
      
      setCourses(coursesWithDetails);
      setShowAddCourseForm(false);
    } catch (err) {
      console.error('Error al crear curso:', err);
      setError(err.message || 'Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditCourseForm(true);
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      await updateCourse({ 
        courseId: courseData.id, 
        name: courseData.name 
      });
      
      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      const coursesWithDetails = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.students ? courseStudents.students.length : 0;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          const teacherName = teacher 
            ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
            : 'Sin docente asignado';
          
          return {
            id: course.id,
            name: course.name,
            teacher: teacherName,
            students: studentsCount,
            status: 'Activo',
          };
        })
      );
      
      setCourses(coursesWithDetails);
      setShowEditCourseForm(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error al actualizar curso:', err);
      setError(err.message || 'Error al actualizar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setSelectedCourse(course);
    setShowDeleteCourseForm(true);
  };

  const handleConfirmDelete = async (course) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCourse(course.id);
      
      setCourses(prev => prev.filter(c => c.id !== course.id));
      setShowDeleteCourseForm(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      setError(err.message || 'Error al eliminar curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-courses">
      <div className="courses-header">
        <h1>Gestión de Cursos</h1>
        <button className="add-course-btn" onClick={handleAddCourse} disabled={loading}>
          {loading ? 'Creando...' : '+ Crear Curso'}
        </button>
      </div>

      {error && <div className="error-message-admin">{error}</div>}


      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
            </div>
            <div className="course-info">
              <p><strong>Docente:</strong> {course.teacher}</p>
              <p><strong>Estudiantes:</strong> {course.students}</p>
            </div>
            <div className="course-actions">
              <button
                className="edit-btn-cursos" 
                onClick={() => handleEditCourse(course)}
                disabled={loading}
              >
                Editar
              </button>
              <button 
                className="delete-btn-cursos" 
                onClick={() => handleDeleteCourse(course)}
                disabled={loading}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="courses-summary">
        <div className="summary-item">
          <span className="summary-number">{courses.length}</span>
          <span className="summary-label">Total Cursos</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">{courses.reduce((acc, c) => acc + c.students, 0)}</span>
          <span className="summary-label">Total Estudiantes</span>
        </div>
      </div>

      {showAddCourseForm && (
        <AddCourseForm
          onClose={handleCloseForm}
          onSubmit={handleCreateCourse}
        />
      )}

      {showEditCourseForm && selectedCourse && (
        <EditCourseForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateCourse}
          course={selectedCourse}
        />
      )}

      {showDeleteCourseForm && selectedCourse && (
        <DeleteCourseForm
          onClose={handleCloseForm}
          onConfirm={handleConfirmDelete}
          course={selectedCourse}
        />
      )}
    </div>
  );
}