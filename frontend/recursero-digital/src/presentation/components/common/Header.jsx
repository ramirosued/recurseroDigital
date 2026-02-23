
import Logo from '../../../assets/logo.png';
import '../../styles/layouts/header.css';
import { useNavigate } from 'react-router-dom';
import { apiRequest, AUTH_ENDPOINTS } from '../../../infrastructure/config/api';

export function Header() {
  const navigate = useNavigate();

  const handleCerrarSesion = async () => {
    try {
      await apiRequest(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      navigate("/");
    }
  };

    return (
      <header className="header bg-space-ui bg-stars-ui">
       <div className="logo">
        <img src={Logo} alt="ReDa Kids" className='app-logo' /></div>
        <div className="header-title">
          <h1>ReDa Kids</h1>
        </div>
        <div className="search-and-mode">
        <div className='boton-cerrar'>
          <button className='cerrar-sesion' onClick={handleCerrarSesion}>Cerrar Sesion</button>
        </div>
      </div>
      </header>
    );
  }