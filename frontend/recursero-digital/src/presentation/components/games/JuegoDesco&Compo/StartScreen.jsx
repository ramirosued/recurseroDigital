import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen = ({ onStart }) => {
    const navigate = useNavigate();

    return (
        <div className="game-container">
            <div className="start-screen">
                <div className="header-controls">
                    <button 
                        className="btn-back-to-levels"
                        onClick={() => navigate('/alumno/juegos')}
                        title="Volver a juegos"
                    >
                        ← Juegos
                    </button>
                </div>

                <h1>🔢 NumeroMágico ✨</h1>
                <p>¡Descubre el misterio de los números!</p>
                <p className="start-subtitle">¿Qué quieres practicar hoy?</p>

                <div className="start-features">
                    <div className="compoydesco-game-modes-container">
                        <button 
                            onClick={() => onStart('decomposition')} 
                            className="compoydesco-mode-card"
                        >
                            <div className="mode-icon">🧩</div>
                            <h3 className="mode-title">Descomposición</h3>
                            <p className="mode-desc">Separa en unidades, decenas y centenas</p>
                            <span className="btn-mode-action">Jugar ➜</span>
                        </button>

                        <button 
                            onClick={() => onStart('composition')} 
                            className="compoydesco-mode-card"
                        >
                            <div className="mode-icon">🔧</div>
                            <h3 className="mode-title">Composición</h3>
                            <p className="mode-desc">Junta las partes para formar el número</p>
                            <span className="btn-mode-action">Jugar ➜</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;