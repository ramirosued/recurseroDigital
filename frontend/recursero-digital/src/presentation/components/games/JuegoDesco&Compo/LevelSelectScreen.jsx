import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../../../hooks/useUserProgress';

const LevelSelectScreen = ({ levels, onSelectLevel, onBackToStart }) => {
    // const navigate = useNavigate();
    const { isLevelUnlocked } = useUserProgress();

    return (
        <div className="game-container">
            <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-levels"
                            onClick={onBackToStart}
                            title="Volver a modos"
                        >
                            ← Modos
                        </button>
                    </div>
                </div>

                <div className="level-select-content">
                <h1 className="level-select-title">✨ Elige tu Nivel ✨</h1>
                <p className="level-select-subtitle">Selecciona el nivel que quieres jugar</p>

                <div className="level-grid">
                    {levels.map((level, index) => {
                        const levelNumber = index + 1;
                        const isUnlocked = isLevelUnlocked('descomposicion', levelNumber);
                        const isLocked = !isUnlocked;
                        
                        return (
                            <button 
                                key={index}
                                className={`level-btn level-${levelNumber} ${isLocked ? 'locked' : ''}`}
                                onClick={() => isUnlocked && onSelectLevel(index)}
                                disabled={isLocked}
                            >
                                <div className="level-header">
                                    <div className="level-number">
                                        {isLocked ? '🔒' : ['📚', '🏆', '🎯'][index]} Nivel {levelNumber}
                                    </div>
                                    <div className="level-difficulty">{level.name}</div>
                                </div>
                                <div className="level-info">
                                    <div className="level-range">Números del {level.range}</div>
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
        </div>
    );
};

export default LevelSelectScreen;