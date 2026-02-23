import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen = ({ onStart }) => {
    const navigate = useNavigate();
    return (
        <div className="game-container">
            <div className="start-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-levels"
                            onClick={() => navigate('/alumno/juegos')}
                            title="Volver a juegos"
                        >
                            ← Juegos
                        </button>
                    </div>
                </div>
                
                <div className="start-content">
                    <h1 className="start-title">✏️ Números en Letras ✏️</h1>
                    <p className="start-description">¡Aprende a escribir los números en palabras!</p>
                    
                    <div className="start-features">
                        <div className="feature-item">
                            <span className="feature-icon">🔢</span>
                            <span className="feature-text">Números del 1 al 100</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🎯</span>
                            <span className="feature-text">Arrastra y suelta</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⭐</span>
                            <span className="feature-text">Gana puntos</span>
                        </div>
                    </div>
                    
                    <div className="button-group">
                        <button onClick={onStart} className="btn btn-start">COMENZAR</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;