import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../../../hooks/useUserProgress';

const LevelSelectScreen = ({ levels, onSelectLevel }) => {
    const navigate = useNavigate();
    const { isLevelUnlocked } = useUserProgress();

    if (!levels || levels.length === 0) {
        return (
            <div className="level-select-screen">
                <div className="level-select-content">
                    <p>No hay niveles disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="level-select-screen">
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
                
                <div className="level-select-content">
                    <h1 className="level-select-title">Elige un nivel</h1>
                    <p className="level-select-subtitle">Selecciona la dificultad que prefieras</p>
                    
                    <div className="level-grid">
                        {levels.map((level, index) => {
                            const levelNumber = index + 1;
                            const isUnlocked = isLevelUnlocked('escritura', levelNumber);
                            const isLocked = !isUnlocked;
                            const range = level.range || `${level.min} - ${level.max}`;
                            
                            return (
                                <button 
                                    key={index} 
                                    onClick={() => isUnlocked && onSelectLevel(levelNumber)} 
                                    className={`level-btn level-${levelNumber} ${isLocked ? 'locked' : ''}`}
                                    disabled={isLocked}
                                >
                                    <div className="level-header">
                                        <div className="level-number">
                                            {isLocked ? '🔒' : '📝'} Nivel {levelNumber}
                                        </div>
                                        <div className="level-difficulty">{level.difficulty || level.name || 'Nivel'}</div>
                                    </div>
                                    <div className="level-info">
                                        <div className="level-range">Números {range}</div>
                                        {isLocked && (
                                            <div className="locked-message">
                                                Completa el nivel {levelNumber - 1} primero
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
    );
};

export default LevelSelectScreen;