import React from 'react';

const orderConfig = {
  asc: {
    icon: '📈',
    name: 'Menor a Mayor',
    textColor: 'text-blue',
    description: 'Ordena los números de menor a mayor'
  },
  desc: {
    icon: '📉',
    name: 'Mayor a Menor',
    textColor: 'text-purple',
    description: 'Ordena los números de mayor a menor'
  }
};

const StartScreen = ({ onStart, onBackToGames }) => {
    return (
        <div className="game-container">
            <div className="start-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-levels"
                            onClick={onBackToGames}
                            title="Volver a juegos"
                        >
                            ← Juegos
                        </button>
                    </div>
                </div>
                <div className="start-content">
                    <h1>🎯 Ordenamiento Numérico</h1>
                    <p>¡Elige cómo ordenar los números!</p>
                    
                    <div className="operation-selection">
                        {Object.entries(orderConfig).map(([key, config]) => (
                            <button 
                                key={key}
                                className={`operation-card ${config.textColor.replace('text-', '')}`}
                                onClick={() => onStart(key)}
                            >
                                <div className="operation-icon">
                                    {config.icon}
                                </div>
                                <div className="operation-title">
                                    {config.name}
                                </div>
                                <div className="operation-description">
                                    {config.description}
                                </div>
                                <div className="operation-levels">
                                    3 niveles de dificultad
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="start-features">
                        <div className="feature-item">
                            <span className="feature-icon">1️⃣</span>
                            <span className="feature-text">Elige Orden</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">2️⃣</span>
                            <span className="feature-text">Escoge Nivel</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">3️⃣</span>
                            <span className="feature-text">¡Ordena!</span>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    );
};

export default StartScreen;
