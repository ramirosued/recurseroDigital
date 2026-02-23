import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./presentation/pages/auth/login";
import LoginForm from "./presentation/pages/auth/LoginForm";
import HomeAlumno from "./presentation/pages/student/homeAlumno";
import HomeDocente from "./presentation/pages/teacher/homeDocente";
import HomeAdmin from "./presentation/pages/admin/homeAdmin";
import AdminUsers from "./presentation/pages/admin/AdminUsers";
import AdminCourses from "./presentation/pages/admin/AdminCourses";
import AdminTeachers from "./presentation/pages/admin/AdminTeachers";
import AdminAssignments from "./presentation/pages/admin/AdminAssignments";
import AdminGameLevels from "./presentation/pages/admin/AdminGameLevels";
import AdminGameConfig from "./presentation/pages/admin/AdminGameConfig";
import DocenteDashboard from "./presentation/pages/teacher/DocenteDashboard";
import TeacherStudents from "./presentation/pages/teacher/TeacherStudents";
import TeacherGames from "./presentation/pages/teacher/TeacherGames";
import TeacherReports from "./presentation/pages/teacher/TeacherReports";
import TeacherStatistics from "./presentation/pages/teacher/TeacherStatistics";
import ReporteDetalle from "./presentation/pages/teacher/ReporteDetalle";
import MainLayout from "./presentation/layouts/MainLayout";
//import DocenteConCurso from "./pages/docenteConCurso";
import JuegoOrdenamiento from "./presentation/components/games/JuegoOrdenamiento/JuegoOrdenamiento.jsx";
import JuegoEscritura from "./presentation/components/games/JuegoEscritura/JuegoEscritura.jsx";
import DashboardAlumno from "./presentation/pages/student/DashboardAlumno.jsx";
import PerfilAlumno from "./presentation/pages/student/perfilAlumno.jsx";
import PerfilDocente from "./presentation/pages/teacher/DocentePerfil.jsx";
import JuegoDescomposicion from './presentation/components/games/JuegoDesco&Compo/JuegoDescomposicion.jsx';
import JuegoEscala from './presentation/components/games/JuegoEscala/JuegoEscala.jsx';
import JuegoCalculos from './presentation/components/games/JuegoCalculos/JuegoCalculos.jsx';
import ProtectedRoute from "./presentation/components/common/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-form" element={<LoginForm />} />
        
        <Route
          path="/alumno/perfil"
          element={
            <MainLayout userRole="alumno">
              <PerfilAlumno />
            </MainLayout>
          }
        />
        <Route
          path="/docente/estudiantes"
          element={
            <MainLayout userRole="docente">
              <TeacherStudents />
            </MainLayout>
          }
        />
        <Route
          path="/docente/juegos"
          element={
            <MainLayout userRole="docente">
              <TeacherGames />
            </MainLayout>
          }
        />
        <Route
          path="/docente/perfil"
          element={
           <MainLayout userRole="docente">
              <PerfilDocente />
            </MainLayout>
          }
        />
        <Route
          path="/docente/reportes"
          element={
            <MainLayout userRole="docente">
              <TeacherReports />
            </MainLayout>
          }
        />
        <Route
          path="/reportes/:studentId"
          element={
            <MainLayout userRole="docente">
              <ReporteDetalle />
            </MainLayout>
          }
        />
        <Route element={<ProtectedRoute allowedRoles={["alumno"]} />}>
          <Route
            path="/alumno"
            element={
              <MainLayout userRole="alumno">
                <HomeAlumno />
              </MainLayout>
            }
          />
          <Route
            path="/alumno/juegos"
            element={
              <MainLayout userRole="alumno">
                <DashboardAlumno/>
              </MainLayout>
            }
          />
          <Route
            path="/alumno/juegos/ordenamiento"
            element={
              <JuegoOrdenamiento />
            }
          />
          <Route
            path="/alumno/juegos/escritura"
            element={
              <JuegoEscritura />
            }
          />
          <Route
            path="/alumno/juegos/descomposicion"
            element={
              <JuegoDescomposicion />
            }
          />
          <Route
            path="/alumno/juegos/escala"
            element={
              <JuegoEscala />
            }
          />
          <Route 
            path="/alumno/juegos/calculos" 
            element={
              <JuegoCalculos />
            } 
          />
          <Route
            path="/alumno/perfil"
            element={
              <MainLayout userRole="alumno">
                <PerfilAlumno />
              </MainLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
          <Route
            path="/docente"
            element={
              <MainLayout userRole="docente">
                <HomeDocente />
              </MainLayout>
            }
          />
          <Route
            path="/docente/dashboard"
            element={
              <MainLayout userRole="docente">
                <DocenteDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/docente/estudiantes"
            element={
              <MainLayout userRole="docente">
                <TeacherStudents />
              </MainLayout>
            }
          />
          <Route
            path="/docente/juegos"
            element={
              <MainLayout userRole="docente">
                <TeacherGames />
              </MainLayout>
            }
          />
          <Route
            path="/docente/estadisticas"
            element={
              <MainLayout userRole="docente">
                <TeacherStatistics />
              </MainLayout>
            }
          />
          <Route
            path="/docente/perfil"
            element={
              <MainLayout userRole="docente">
                <PerfilDocente/>
              </MainLayout>
            }
          />
          <Route
            path="/docente/reportes"
            element={
              <MainLayout userRole="docente">
                <TeacherReports />
              </MainLayout>
            }
          />
          <Route
            path="/reportes/:studentId"
            element={
              <MainLayout userRole="docente">
                <ReporteDetalle />
              </MainLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin"
            element={
              <MainLayout userRole="admin">
                <HomeAdmin />
              </MainLayout>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <MainLayout userRole="admin">
                <AdminUsers />
              </MainLayout>
            }
          />
          <Route
            path="/admin/cursos"
            element={
              <MainLayout userRole="admin">
                <AdminCourses />
              </MainLayout>
            }
          />
          <Route
            path="/admin/juegos"
            element={
              <MainLayout userRole="admin">
                <AdminGameLevels />
              </MainLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <MainLayout userRole="admin">
                <HomeAdmin />
              </MainLayout>
            }
          />
          <Route
            path="/admin/docentes"
            element={
              <MainLayout userRole="admin">
                <AdminTeachers />
              </MainLayout>
            }
          />
          <Route
            path="/admin/asignaciones"
            element={
              <MainLayout userRole="admin">
                <AdminAssignments />
              </MainLayout>
            }
          />
          <Route
            path="/admin/config-juegos"
            element={
              <MainLayout userRole="admin">
                <AdminGameConfig />
              </MainLayout>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
