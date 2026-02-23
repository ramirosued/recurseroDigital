import { useEffect, useState } from "react";
import { NavBar } from "../components/common/NavBar";
import { Header } from "../components/common/Header";
import { useLocation } from "react-router-dom";
import "../styles/layouts/layout.css";


export default function MainLayout({ children, userRole = "alumno" }) {
  const [activeTab, setActiveTab] = useState("home");
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/juegos')) {
      setActiveTab("games");
    } else if (path.includes('/perfil')) {
      setActiveTab("profile");
    } else if (path.includes('/estudiantes')) {
      setActiveTab("students");
    } else if (path.includes('/dashboard')) {
      setActiveTab("home");
    } else if (path.includes('/usuarios')) {
      setActiveTab("users");
    } else if (path.includes('/cursos')) {
      setActiveTab("courses");
    } else if (path.includes('/asignaciones')) {
      setActiveTab("assignments");
    } else if (path.includes('/config-juegos')) {
      setActiveTab("games");
    } else if (path.includes('/estadisticas')) {
      setActiveTab("statistics");
    } else {
      setActiveTab("home");
    }
  }, [location.pathname]);

  const tabs = userRole === "alumno" 
    ? [
        { id: "home", label: "🏠 Inicio", path: "/alumno" },
        { id: "games", label: "🎮 Juegos", path: "/alumno/juegos" }
       ]
    : userRole === "docente"
    ? [
        { id: "home", label: "🏠 Inicio", path: "/docente/dashboard" },
        { id: "statistics", label: "📊 Estadísticas", path: "/docente/estadisticas" }
      ]
    : [
        { id: "home", label: "🏠 Inicio", path: "/admin" },
        { id: "courses", label: "📚 Cursos", path: "/admin/cursos" },
        { id: "users", label: "👥 Usuarios", path: "/admin/usuarios" },
        { id: "assignments", label: "📋 Asignaciones", path: "/admin/asignaciones" },
        { id: "games", label: "🎮 Configuración Juegos", path: "/admin/config-juegos" }
      ];

  return (
    <div className="main-layout">
      <Header />
      <NavBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userRole={userRole}
      />
      <main className={`main-content ${userRole !== 'admin' ? 'bg-space bg-space-gradient bg-stars' : ''} scrollbar-space`}>
        {children}
      </main>
    </div>
  );
}
