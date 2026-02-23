import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherCourses } from '../../../infrastructure/adapters/api/teacherApi';
import "../../styles/components/cursoSelector.css";




export default function CursoSelector() {
  const navigate = useNavigate();
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

  const coloresDisponibles = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

  const obtenerIcono = () => {
    return "🔢";
  };

  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return '';
    return texto.toUpperCase();
  };

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setUsername(capitalizarPrimeraLetra(userEmail));
    }
  }, []);

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('No hay token de autenticación, usando datos mock temporales');
          const cursosMock = [
            {
              id: 1,
              name: "Matemáticas 3° A",
              color: coloresDisponibles[0]
            },
            {
              id: 2, 
              name: "Matemáticas 3° B",
              color: coloresDisponibles[1]
            }
          ];
          
          const cursosConEstilo = cursosMock.map((curso) => ({
            id: curso.id.toString(),
            nombre: curso.name,
            icono: obtenerIcono(),
            color: curso.color
          }));
          
          setCursos(cursosConEstilo);
          setLoading(false);
          return;
        }

        const response = await getTeacherCourses();
        
        if (response.courses && response.courses.length > 0) {
          const cursosConEstilo = response.courses.map((curso, index) => ({
            id: curso.id.toString(),
            nombre: curso.name,
            icono: obtenerIcono(),
            color: coloresDisponibles[index % coloresDisponibles.length]
          }));
          
          setCursos(cursosConEstilo);
        } else {
          console.warn('La API no devolvió cursos, usando datos mock temporales');
          const cursosMock = [
            {
              id: 1,
              name: "Matemáticas 3° A",
              color: coloresDisponibles[0]
            }
          ];
          
          const cursosConEstilo = cursosMock.map((curso) => ({
            id: curso.id.toString(),
            nombre: curso.name,
            icono: obtenerIcono(),
            color: curso.color
          }));
          
          setCursos(cursosConEstilo);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        
        console.warn('Error en API, usando datos mock temporales');
        const cursosMock = [
          {
            id: 1,
            name: "Matemáticas 3° A",
            color: coloresDisponibles[0]
          }
        ];
        
        const cursosConEstilo = cursosMock.map((curso) => ({
          id: parseInt(curso.id),
          nombre: curso.name,
          icono: obtenerIcono(),
          color: curso.color
        }));
        
        setCursos(cursosConEstilo);
        setError(null);
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  console.log('CursoSelector renderizado con cursos:', cursos);

  const handleCursoSelect = (curso) => {
    console.log('Curso seleccionado:', curso);
    setCursoSeleccionado(curso);
    localStorage.setItem('cursoSeleccionado', JSON.stringify(curso));
    console.log('Curso guardado en localStorage:', localStorage.getItem('cursoSeleccionado'));
    navigate('/docente/dashboard');
  };

  if (loading) {
    return (
      <div className="curso-selector-container">
        <div className="curso-selector-header">
          <h1>{username ? username : 'Docente'}</h1>
          <p>Cargando tus cursos...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curso-selector-container">
        <div className="curso-selector-header">
          <h1> {username ? username : 'Docente'}</h1>
          <p>Error al cargar los cursos</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="curso-selector-container">
      <div className="curso-selector-header">
        <h1>{username ? username : 'Docente'}</h1>
        <p>Selecciona el curso que deseas gestionar</p>
      </div>
      
      <div className="cursos-grid">
        {cursos.length === 0 ? (
          <div className="no-courses">
            <p>No tienes cursos asignados</p>
          </div>
        ) : (
          cursos.map((curso) => (
            <div 
              key={curso.id}
              className={`curso-card ${cursoSeleccionado?.id === curso.id ? 'selected' : ''}`}
              onClick={() => handleCursoSelect(curso)}
              onMouseDown={() => handleCursoSelect(curso)}
              onTouchStart={() => handleCursoSelect(curso)}
              style={{ '--curso-color': curso.color }}
            >
              <div className="curso-icono">
                {curso.icono}
              </div>
              <h3 className="curso-nombre">{curso.nombre}</h3>
            </div>
          ))
        )}
      </div>
      
      <div className="curso-selector-footer">
        <p>💡 Podrás cambiar de curso en cualquier momento desde tu perfil</p>
      </div>
    </div>
  );
}