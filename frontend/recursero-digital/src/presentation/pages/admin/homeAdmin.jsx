import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/homeAdmin.css';

export default function HomeAdmin() {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "Usuarios",
      description: "Gestiona estudiantes y docentes",
      icon: "👥",
      href: "/admin/usuarios",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))",
      iconColor: "#2563eb",
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    {
      title: "Cursos",
      description: "Administra cursos del sistema",
      icon: "📚",
      href: "/admin/cursos",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1))",
      iconColor: "#9333ea",
      borderColor: "rgba(168, 85, 247, 0.3)",
    },
    {
      title: "Asignaciones",
      description: "Administra asignaciones activas",
      icon: "📋",
      href: "/admin/asignaciones",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))",
      iconColor: "#059669",
      borderColor: "rgba(16, 185, 129, 0.3)",
    },
    {
      title: "Configuración Juegos",
      description: "Gestiona niveles y configuraciones de juegos",
      icon: "🎮",
      href: "/admin/config-juegos",
      gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1))",
      iconColor: "#ea580c",
      borderColor: "rgba(249, 115, 22, 0.3)",
    },
  ];

  return (
    <div className="home-admin">
      <div className="admin-welcome">
        <h1>Bienvenido, Administrador</h1>
        <p>Panel de control principal del sistema</p>
      </div>

      <div className="admin-cards-grid">
        {adminCards.map((card) => (
          <div
            key={card.title}
            className="admin-card-modern"
            onClick={() => navigate(card.href)}
          >
            {/* Gradient Background on Hover */}
            <div
              className="card-gradient-bg"
              style={{ background: card.gradient }}
            />

            {/* Content */}
            <div className="card-content-modern">
              {/* Icon Container */}
              <div
                className="card-icon-container"
                style={{
                  background: card.gradient,
                  borderColor: card.borderColor
                }}
              >
                <span className="card-icon-modern">{card.icon}</span>
              </div>

              {/* Text Content */}
              <h3 className="card-title-modern">{card.title}</h3>
              <p className="card-description-modern">{card.description}</p>

              {/* Hover Arrow */}
              <div className="card-action">
                <span>Gestionar</span>
                <svg
                  className="card-arrow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="card-decorative-corner">
              <span>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}