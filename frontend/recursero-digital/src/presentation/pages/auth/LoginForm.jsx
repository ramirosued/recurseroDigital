import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest, AUTH_ENDPOINTS } from "../../../infrastructure/config/api";
import "../../styles/pages/loginForm.css";
import Logo from '../../../assets/logo.png';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("alumno");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.role) {
      setActiveTab(location.state.role);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      let endpoint;
      if (activeTab === "alumno") {
        endpoint = AUTH_ENDPOINTS.LOGIN_STUDENT;
      } else if (activeTab === "docente") {
        endpoint = AUTH_ENDPOINTS.LOGIN_TEACHER;
      } else if (activeTab === "admin") {
        endpoint = AUTH_ENDPOINTS.LOGIN_ADMIN;
      }
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          user: email,
          password: password
        })
      });

      console.log('Respuesta del login:', response);

      if (response.ok) {
        if (!response.data || !response.data.token) {
          console.error('No se recibió token en la respuesta:', response.data);
          setError('Error: No se recibió token del servidor. Verifica la respuesta del backend.');
          return;
        }

        const token = response.data.token;
        console.log('Token recibido:', token ? 'Token presente' : 'Token vacío');
        
        localStorage.setItem('token', token);
        localStorage.setItem('userType', activeTab);
        localStorage.setItem('userEmail', email);
        
        const savedToken = localStorage.getItem('token');
        console.log('Token guardado en localStorage:', savedToken ? 'Sí' : 'No'); // Debug
        
        if (!savedToken) {
          setError('Error: No se pudo guardar el token. Verifica la configuración del navegador.');
          return;
        }

        if (activeTab === "alumno") {
          navigate("/alumno");
        } else if (activeTab === "docente") {
          navigate("/docente");
        } else if (activeTab === "admin") {
          navigate("/admin");
        }
      } else {
        setError(response.data?.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="login-form-container bg-space bg-space-gradient bg-stars">
      <button 
        onClick={handleGoBack}
        className="back-button"
        title="Volver a selección de rol"
        aria-label="Volver a selección de rol"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div className="login-form-content">
        <div className="header-section">
          <img src={Logo} alt="ReDa Kids" className="imagen-logo" />
          <h1 className="titulo">ReDa Kids</h1>
          <p className="subtitulo">Inicia sesión para continuar</p>
        </div>

        
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-messages">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="text" className="form-label">Username</label>
            <input
              type="text"
              id="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="password-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.523 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                 
                   <svg className="password-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-button ${activeTab}`}
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : `Iniciar como ${activeTab === "alumno" ? "Estudiante" : activeTab === "docente" ? "Docente" : "Administrador"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
