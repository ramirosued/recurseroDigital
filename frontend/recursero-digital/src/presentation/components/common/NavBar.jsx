import { useNavigate } from "react-router-dom";
import "../../styles/layouts/navbar.css";

export function NavBar({ tabs, activeTab, onTabChange, userRole}) {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    onTabChange(tab.id);
    navigate(tab.path);
  };

  const navbarClasses = userRole === "docente"
    ? `navbar ${userRole} bg-space-docente bg-stars-docente`
    : userRole=== "alumno" ? `navbar ${userRole} bg-space-ui bg-stars-ui`
    : `navbar ${userRole} bg-space-admin bg-stars-admin`;

  return (
    <nav className={navbarClasses}>
      <div className="navbar-tabs">
        {tabs.map((tab) => {
          const buttonClasses = activeTab === tab.id 
            ? "tab-button active bg-accent-active"
            : "tab-button";
          
          return (
            <button
              key={tab.id}
              className={buttonClasses}
              onClick={() => handleTabClick(tab)} 
              onMouseEnter={(e) => !e.target.classList.contains('active') && e.target.classList.add('bg-accent-hover')}
              onMouseLeave={(e) => e.target.classList.remove('bg-accent-hover')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}