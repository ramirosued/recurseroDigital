import React from 'react';
import { useUserProgress } from '../../../hooks/useUserProgress';
import { getOrderConfig, formatNumber } from './utils';

const LevelSelectScreen = ({ order, onSelectLevel, onBackToStart, backendLevels = [] }) => {
    const { isLevelUnlocked } = useUserProgress();
    const orderInfo = getOrderConfig(order);
    
    
    const formatRange = (min, max) => {
        return `${formatNumber(min)} - ${formatNumber(max)}`;
    };
    
    
    const levels = backendLevels.map((level) => ({
        number: level.level,
        name: level.name,
        range: formatRange(level.config.min, level.config.max),
        difficulty: level.difficulty,
        color: `level-${level.level}`,
        min: level.config.min,
        max: level.config.max
    }));

    return (
        <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-levels"
                            onClick={onBackToStart}
                            title="Volver a selección de orden"
                        >
                            ← Orden
                        </button>
                    </div>
                </div>
                <div className="level-select-content">
                    <h1 className="level-select-title">{orderInfo.icon} {orderInfo.name}</h1>
                    <p className="level-select-subtitle">{orderInfo.description}</p>
                    <div className="level-grid">
                        {levels.map(level => {
                    const isUnlocked = isLevelUnlocked('ordenamiento', level.number);
                    const isLocked = !isUnlocked;
                    
                    return (
                        <button
                            key={level.number}
                            className={`level-btn ${level.color} ${isLocked ? 'locked' : ''}`}
                            onClick={() => isUnlocked && onSelectLevel(level.number)}
                            disabled={isLocked}
                        >
                            <div className="level-number">
                                {isLocked ? '🔒' : ''} {level.name}
                            </div>
                            <div className="level-range">{level.range}</div>
                            <div className="level-difficulty">{level.difficulty}</div>
                            {isLocked && (
                                <div className="locked-message">
                                    Completa el nivel {level.number - 1} para desbloquear
                                </div>
                            )}
                        </button>
                    );
                })}
                </div>
            </div>
        </div>
    );
};export default LevelSelectScreen;
