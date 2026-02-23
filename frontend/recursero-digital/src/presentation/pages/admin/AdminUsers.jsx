import React, { useEffect, useState } from "react";
import AddUserForm from "./AddUserForm";
import EditStudentForm from "./EditStudentForm";
import EditTeacherForm from "./EditTeacherForm";
import BulkUploadForm from "./BulkUploadForm";
import "../../styles/pages/adminUsers.css";
import AdminTeachers from "../admin/AdminTeachers";
import { createStudent, getAllStudents, createTeacher, getAllTeachers, getAllCourses, getCourseStudents, updateStudent, deleteStudent, enableStudent, updateTeacher, deleteTeacher, enableTeacher, bulkUploadStudents } from "../../services/adminService";

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("students");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showBulkUploadForm, setShowBulkUploadForm] = useState(false);
  const [showEditStudentForm, setShowEditStudentForm] = useState(false);
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión como administrador.");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const coursesData = await getAllCourses();
        setCourses(coursesData);
        
        if (activeTab === "students") {
          const data = await getAllStudents();
          setStudents(
            data.map((s) => {
              const course = coursesData.find(c => c.id === s.courseId);
              return {
                id: s.id,
                name: s.name || `${s.firstName} ${s.lastName}`,
                firstName: s.firstName,
                lastName: s.lastName,
                username: s.username,
                courseId: s.courseId || null,
                courseName: course ? course.name : 'Sin curso',
                enable: s.enable !== undefined ? s.enable : true,
                status: s.enable !== false ? "Activo" : "Inactivo",
              };
            })
          );
        } else if (activeTab === "teachers") {
          const [teachersData, coursesData] = await Promise.all([
            getAllTeachers(),
            getAllCourses()
          ]);
          
          const teachersWithDetails = await Promise.all(
            teachersData.map(async (teacher) => {
              const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
              
              const allStudents = new Set();
              
              for (const course of teacherCourses) {
                try {
                  const courseStudents = await getCourseStudents(course.id);
                  if (Array.isArray(courseStudents)) {
                    courseStudents.forEach(student => allStudents.add(student.id));
                  }
                } catch (err) {
                  console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
                }
              }
              
              return {
                id: teacher.id,
                name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
                firstName: teacher.firstName || teacher.name,
                lastName: teacher.lastName || teacher.surname,
                surname: teacher.surname,
                username: teacher.username,
                email: teacher.email,
                enable: teacher.enable !== undefined ? teacher.enable : true,
                status: teacher.enable !== false ? "Activo" : "Inactivo",
                courses: teacherCourses,
                students: Array.from(allStudents).map(id => ({ id })) // Array de IDs únicos
              };
            })
          );
          
          setTeachers(teachersWithDetails);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message || "No se pudieron cargar los datos. Verifica que estés logueado como administrador.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleAddUser = () => {
    setShowAddUserForm(true);
  };

  const handleBulkUpload = () => {
    setShowBulkUploadForm(true);
  };

  const handleBulkUploadSubmit = async (studentsData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bulkUploadStudents(studentsData);
      
      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || s.firstName + " " + s.lastName,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
      
      setShowBulkUploadForm(false);
      
      let message = result.message;
      if (result.errorDetails && result.errorDetails.length > 0) {
        message += "\n\nDetalles de errores:\n" + result.errorDetails.join("\n");
      }
      alert(message);
      
    } catch (err) {
      console.error("Error en carga masiva:", err);
      setError(err.message || "Error en la carga masiva de estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowAddUserForm(false);
    setShowBulkUploadForm(false);
    setShowEditStudentForm(false);
    setShowEditTeacherForm(false);
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setFormError(null);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowEditStudentForm(true);
  };

  const handleToggleStudentStatus = async (student) => {
    try {
      setLoading(true);
      setError(null);
      
      if (student.enable === false) {
        await enableStudent(student.id);
      } else {
        await deleteStudent(student.id);
      }
      
      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
    } catch (err) {
      console.error("Error al cambiar estado del estudiante:", err);
      setError(err.message || "Error al cambiar estado del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacherForm(true);
  };

  const handleToggleTeacherStatus = async (teacher) => {
    try {
      setLoading(true);
      setError(null);
      
      if (teacher.enable === false) {
        await enableTeacher(teacher.id);
      } else {
        await deleteTeacher(teacher.id);
      }
      
      const [teachersData, coursesData] = await Promise.all([
        getAllTeachers(),
        getAllCourses()
      ]);
      
      const teachersWithDetails = await Promise.all(
        teachersData.map(async (teacher) => {
          const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
          const allStudents = new Set();
          
          for (const course of teacherCourses) {
            try {
              const courseStudents = await getCourseStudents(course.id);
              if (Array.isArray(courseStudents)) {
                courseStudents.forEach(student => allStudents.add(student.id));
              }
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
            }
          }
          
          return {
            id: teacher.id,
            name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
            firstName: teacher.firstName || teacher.name,
            lastName: teacher.lastName || teacher.surname,
            surname: teacher.surname,
            username: teacher.username,
            email: teacher.email,
            enable: teacher.enable !== undefined ? teacher.enable : true,
            status: teacher.enable !== false ? "Activo" : "Inactivo",
            courses: teacherCourses,
            students: Array.from(allStudents).map(id => ({ id }))
          };
        })
      );
      
      setTeachers(teachersWithDetails);
    } catch (err) {
      console.error("Error al cambiar estado del docente:", err);
      setError(err.message || "Error al cambiar estado del docente");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      setLoading(true);
      setError(null);
      await updateStudent(studentData);
      
      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
      
      handleCloseForm();
    } catch (err) {
      console.error("Error al actualizar estudiante:", err);
      setError(err.message || "Error al actualizar estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (teacherData) => {
    try {
      setLoading(true);
      setError(null);
      await updateTeacher(teacherData);
      
      const [teachersData, coursesData] = await Promise.all([
        getAllTeachers(),
        getAllCourses()
      ]);
      
      const teachersWithDetails = await Promise.all(
        teachersData.map(async (teacher) => {
          const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
          const allStudents = new Set();
          
          for (const course of teacherCourses) {
            try {
              const courseStudents = await getCourseStudents(course.id);
              if (Array.isArray(courseStudents)) {
                courseStudents.forEach(student => allStudents.add(student.id));
              }
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
            }
          }
          
          return {
            id: teacher.id,
            name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
            username: teacher.username,
            email: teacher.email,
            enable: teacher.enable !== undefined ? teacher.enable : true,
            status: teacher.enable !== false ? "Activo" : "Inactivo",
            courses: teacherCourses,
            students: Array.from(allStudents).map(id => ({ id }))
          };
        })
      );
      
      setTeachers(teachersWithDetails);
      handleCloseForm();
    } catch (err) {
      console.error("Error al actualizar docente:", err);
      setError(err.message || "Error al actualizar docente");
    } finally {
      setLoading(false);
    }
  };

  const [formError, setFormError] = useState(null);

  const handleUserSubmit = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setFormError(null);

      if (activeTab === "students") {
        await createStudent(userData);
        const data = await getAllStudents();
        setStudents(
          data.map((s) => {
            const course = courses.find(c => c.id === s.courseId);
            return {
              id: s.id,
              name: s.name || `${s.firstName} ${s.lastName}`,
              firstName: s.firstName,
              lastName: s.lastName,
              username: s.username,
              courseId: s.courseId || null,
              courseName: course ? course.name : 'Sin curso',
              enable: s.enable !== undefined ? s.enable : true,
              status: s.enable !== false ? "Activo" : "Inactivo",
            };
          })
        );
      } else if (activeTab === "teachers") {
        await createTeacher({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          username: userData.username,
          password: userData.password,
        });
        const [teachersData, coursesData] = await Promise.all([
          getAllTeachers(),
          getAllCourses()
        ]);
        
        const teachersWithDetails = await Promise.all(
          teachersData.map(async (teacher) => {
            const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
            const allStudents = new Set();
            
            for (const course of teacherCourses) {
              try {
                const courseStudents = await getCourseStudents(course.id);
                if (Array.isArray(courseStudents)) {
                  courseStudents.forEach(student => allStudents.add(student.id));
                }
              } catch (err) {
                console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
              }
            }
            
            return {
              id: teacher.id,
              name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
              firstName: teacher.firstName || teacher.name,
              lastName: teacher.lastName || teacher.surname,
              surname: teacher.surname,
              username: teacher.username,
              email: teacher.email,
              enable: teacher.enable !== undefined ? teacher.enable : true,
              status: teacher.enable !== false ? "Activo" : "Inactivo",
              courses: teacherCourses,
              students: Array.from(allStudents).map(id => ({ id }))
            };
          })
        );
        
        setTeachers(teachersWithDetails);
      }

      setFormError(null);
      setShowAddUserForm(false);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const errorMessage = err.message || "Error al crear usuario";
      setFormError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <div className="header-actions">
          <button className="add-user-btn" onClick={handleAddUser} disabled={loading}>
            {loading ? "Guardando..." : "+ Agregar Usuario"}
          </button>
          {activeTab === "students" && (
            <button className="bulk-upload-btn" onClick={handleBulkUpload} disabled={loading}>
              📄 Carga Masiva
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message-admin">{error}</div>}

      <div className="users-tabs">
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Estudiantes
        </button>
        <button
          className={`tab-btn ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          Docentes
        </button>
      </div>

      {activeTab === "students" && (
        <div className="users-table">
          <h2>Estudiantes</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Username</th>
                <th>Curso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.username}</td>
                  <td>{student.courseName || 'Sin curso'}</td>
                  <td>
                    <button 
                      className="edit-botn" 
                      onClick={() => handleEditStudent(student)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button 
                      className={student.enable === false ? "activate-botn" : "delete-botn"} 
                      onClick={() => handleToggleStudentStatus(student)}
                      disabled={loading}
                    >
                      {student.enable === false ? "Activar" : "Desactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "teachers" && (
        <AdminTeachers 
          teachers={teachers} 
          onEdit={handleEditTeacher}
          onToggleStatus={handleToggleTeacherStatus}
        />
      )}

      {showAddUserForm && (
        <AddUserForm
          onClose={handleCloseForm}
          onSubmit={handleUserSubmit}
          userType={
            activeTab === "students"
              ? "estudiante"
              : activeTab === "teachers"
              ? "docente"
              : "administrador"
          }
          error={formError}
        />
      )}

      {showEditStudentForm && selectedStudent && (
        <EditStudentForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateStudent}
          student={selectedStudent}
          courses={courses}
        />
      )}

      {showEditTeacherForm && selectedTeacher && (
        <EditTeacherForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateTeacher}
          teacher={selectedTeacher}
          courses={courses}
        />
      )}

      {showBulkUploadForm && (
        <BulkUploadForm
          onClose={handleCloseForm}
          onSubmit={handleBulkUploadSubmit}
        />
      )}
    </div>
  );
}
