import React, { useState } from "react";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import "../../styles/pages/perfilAlumno.css";

export default function PerfilAlumno() {
  const { data: studentData, loading, error } = useStudentProfile();
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');


  const handleAvatarChange = () => {
    setSelectedAvatar(prevAvatar => prevAvatar === '🚀' ? '⭐' : '🚀');
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="loading-message">
            <h2> Cargando tu perfil...</h2>
            <p>Recopilando tus aventuras</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="error-message">
            <h2>😱 Oops! Algo salió mal</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Intentar nuevamente</button>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="no-data-message">
            <h2>📊 No hay datos disponibles</h2>
            <p>No se pudieron cargar las estadísticas</p>
          </div>
        </div>
      </div>
    );
  }
  const totalScore = Object.values(studentData.stats || {})
  .reduce((total, game) => total + (game.highScore ?? 0), 0);

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="avatar-section">
          <div className="perfil-avatar emoji-avatar" onClick={handleAvatarChange} style={{ cursor: 'pointer' }}>
            {selectedAvatar}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#ffffff', marginTop: '0.5rem', textAlign: 'center' }}>
            Click para cambiar avatar
          </p>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">¡Hola {studentData.name}!</h1>
          <p className="profile-title">🚀 Explorador de Matemáticas 🚀</p>
          <div className="achievements">
            <div className="achievement-item">
              🏆 <span>{totalScore}</span> puntos totales
            </div>

          </div>
        </div>
      </div>
      <div className="games-stats">
        <h2 className="stats-title">🎮 Mis Aventuras Matemáticas 🎮</h2>

      
        <div className="games-grid">
          {studentData.stats && Object.entries(studentData.stats).map(([gameKey, gameStats]) => {
const gameInfo = {
  'ordenamiento': { name: 'Ordenamiento de Números', icon: '🔢' },
  'escritura': { name: 'Números en Palabras', icon: '✍️' },
  'descomposicion': { name: 'Descomposición', icon: '🧮' },
  'calculos': { name: 'Cálculos', icon: '➕' },   // ← corregido
  'escala': { name: 'Escala', icon: '📊' }
};

            const game = gameInfo[gameKey] || { name: gameKey, icon: '🎮' };

            return (
              <div key={gameKey} className="card-game">
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-title">{game.name}</h3>
                <div className="game-stats">
                  {gameStats.highScore !== undefined && (
                    <div className="stat-row">
                      <span className="stat-emoji">🎯</span>
                      <span>Mejor puntaje: {gameStats.highScore}</span>
                    </div>
                  )}
                  {gameStats.gamesPlayed !== undefined && (
                    <div className="stat-row">
                      <span className="stat-emoji">🎲</span>
                      <span>Partidas jugadas: {gameStats.gamesPlayed}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
