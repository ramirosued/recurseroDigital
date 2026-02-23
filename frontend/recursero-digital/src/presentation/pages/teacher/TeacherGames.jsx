import React, { useState, useEffect } from 'react';
import { getTeacherCourses, getCourseGames, updateCourseGameStatus } from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/pages/teacherGames.css';

const TeacherGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const getGameIcon = (gameName) => {
    const name = gameName.toLowerCase();
    if (name.includes('ordenamiento') || name.includes('ordenar')) return '🔢';
    if (name.includes('escritura') || name.includes('escribir')) return '✍️';
    if (name.includes('descomposición') || name.includes('composición')) return '🧮';
    if (name.includes('escala') || name.includes('numérica')) return '📏';
    if (name.includes('cálculo') || name.includes('calculo')) return '🧮';
    return '🎮';
  };

  const getDifficultyText = (difficultyLevel) => {
    switch (difficultyLevel) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Medio';
      case 3:
        return 'Difícil';
      default:
        return 'Medio';
    }
  };

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const coursesResponse = await getTeacherCourses();
        const courses = coursesResponse.courses || [];

        if (courses.length === 0) {
          setError('No tienes cursos asignados');
          setLoading(false);
          return;
        }

        const storedCourse = localStorage.getItem('cursoSeleccionado');
        let courseId;

        if (storedCourse) {
          try {
            const parsedCourse = JSON.parse(storedCourse);
            courseId = parsedCourse.id;
          } catch (e) {
            courseId = courses[0].id;
          }
        } else {
          courseId = courses[0].id;
        }

        setSelectedCourse(courseId);

        const gamesResponse = await getCourseGames(courseId);
        const courseGames = gamesResponse.games || [];

        const mappedGames = courseGames.map((courseGame) => {
          const game = courseGame.game;
          if (!game) return null;

          return {
            id: game.id,
            name: game.name,
            description: game.description,
            icon: getGameIcon(game.name),
            difficulty: getDifficultyText(game.difficultyLevel),
            status: courseGame.isEnabled ? 'active' : 'inactive',
            courseGameId: courseGame.id
          };
        }).filter(game => game !== null);

        setGames(mappedGames);
      } catch (err) {
        console.error('Error al cargar juegos:', err);
        setError('Error al cargar los juegos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  const handleToggleGame = async (courseGameId, isCurrentlyEnabled, e) => {
    e.stopPropagation();
    
    try {
      const newStatus = !isCurrentlyEnabled;
      
      await updateCourseGameStatus(courseGameId, newStatus);
      
      setGames(prevGames => 
        prevGames.map(game => 
          game.courseGameId === courseGameId
            ? { ...game, status: newStatus ? 'active' : 'inactive' }
            : game
        )
      );
    } catch (error) {
      console.error('Error al actualizar estado del juego:', error);
      alert(`Error al ${isCurrentlyEnabled ? 'deshabilitar' : 'habilitar'} el juego: ${error.message}`);
    }
  };

  

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil': return 'easy';
      case 'medio': return 'medium';
      case 'difícil': return 'hard';
      default: return 'medium';
    }
  };


  if (loading) {
    return (
      <div className="teacher-games">
        <div className="games-content">
          <div className="games-headers">
            <h1>🎮 Gestión de Juegos</h1>
            <p>Habilitar o deshabilitar juegos para tus cursos</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando juegos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-games">
        <div className="games-content">
          <div className="games-headers">
            <h1>🎮 Gestión de Juegos</h1>
            <p>Habilitar o deshabilitar juegos para tus cursos</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-games">
      <div className="games-content">
        <div className="games-headers">
          <h1>🎮 Gestión de Juegos</h1>
          <p>Habilitar o deshabilitar juegos para tus cursos</p>
        </div>

        <div className="games-overview">
          {/* Estadísticas generales */}
          <div className="overview-stats">
            <div className="stat-cards total-games">
              <div className="stat-icon">🎮</div>
              <div className="stats-content">
                <h2>Cantidad de Juegos</h2>
                <h3>{games.length}</h3>
                
              </div>
            </div>
            <div className="stat-cards active-games">
              <div className="stat-icon">✅</div> 
              <div className="stats-content">
                <h2>Juegos Activos</h2>
                <h3>{games.filter(game => game.status === 'active').length}</h3>
                
              </div>
            </div>
          </div>

          {/* Lista de juegos */}
          {games.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No hay juegos disponibles para este curso.</p>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="game-cards"
                >
                  <div className='game-status-row'>
                    <div className={`game-status ${game.status}`}>
                      {game.status === 'active' ? 'Activo' : 'Inactivo'}
                    </div>
                    <div className={`game-difficulty ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </div>
                  </div>
                  <div className="game-header">
                    <div className="game-icons">{game.icon}</div>
                    <div className="game-info">
                      <h3>{game.name}</h3>
                      <p>{game.description}</p>
                    </div>
                  </div>

                  <div className="game-actions">
                    <button 
                      className={`action-btn-games ${game.status === 'active' ? 'disable-game' : 'enable-game'}`}
                      onClick={(e) => handleToggleGame(game.courseGameId, game.status === 'active', e)}
                    >
                      {game.status === 'active' ? '🚫 Deshabilitar Juego' : '✅ Habilitar Juego'}
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGames;


