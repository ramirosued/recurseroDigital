import React from 'react';
import GameHeader from './GameHeader';

const GameCompleteScreen = ({
  points,
  currentLevel,
  totalActivities,
  onBackToGames,
  onBackToLevels,
  onPlayAgain
}) => {
  return (
    <div className="game-content">
      <header className="game-header">
        <GameHeader
          currentLevel={currentLevel + 1}
          currentActivity={totalActivities}
          totalActivities={totalActivities}
          attempts={0}
          points={points}
          onBackToGames={onBackToGames}
          onBackToLevels={onBackToLevels}
        />
        <h1 className="game-title">🎯 Ordenamiento Numérico</h1>
      </header>

      <div className="progress-container">
        <div 
          className="ordenamiento-progress-bar"
          data-progress="100"
          style={{'--progress-width': '100%'}}
        />
      </div>

      <div className="game-complete">
        <h2 className="complete-title">🎉 ¡Felicitaciones!</h2>
        <p className="complete-message">¡Has completado todos los niveles del juego de ordenamiento!</p>
        <p className="final-score">Puntuación final: {points}</p>
        <div className="complete-buttons">
          <button className="restart-button" onClick={onBackToLevels}>
            📊 Ver Niveles
          </button>
          <button className="restart-button" onClick={onPlayAgain}>
            🔄 Jugar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteScreen;
