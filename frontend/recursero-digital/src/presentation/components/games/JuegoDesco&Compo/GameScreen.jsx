import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameScreen = ({ 
    level, 
    activity, 
    totalActivities,
    points,
    attempts,
    question,
    userAnswer,
    onAnswerChange,
    onCheckAnswer,
    onBackToLevels,
    formatNumber
}) => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userAnswer.trim()) {
            onCheckAnswer();
        }
    };

    return (
        <div className="game-content">
            <header className="desco-game-header">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-dashboard"
                            onClick={() => navigate('/alumno/juegos')}
                            title="Volver al dashboard"
                        >
                            ← Juegos
                        </button>
                        <button 
                            className="btn-back-to-levels"
                            onClick={onBackToLevels}
                            title="Volver a niveles"
                        >
                            ← Niveles
                        </button>
                    </div>
                    
                    <div className="game-status">
                        <div className="status-item">
                            <div className="status-icon">🏆</div>
                            <div className="status-label">Nivel</div>
                            <div className="status-value">{level}</div>
                        </div>
                        <div className="status-item">
                            <div className="status-icon">📝</div>
                            <div className="status-label">Actividad</div>
                            <div className="status-value">{activity}/{totalActivities}</div>
                        </div>
                        <div className="status-item">
                            <div className="status-icon">⭐</div>
                            <div className="status-label">Puntos</div>
                            <div className="status-value">{points}</div>
                        </div>
                        <div className="status-item">
                            <div className="status-icon">🎯</div>
                            <div className="status-label">Intentos</div>
                            <div className="status-value">{attempts}</div>
                        </div>
                    </div>
                </div>
                
                <h1 className="game-title">🧩 Descomposición y Composición Numérica</h1>
                <p className="game-instruction">
                    {question.type === 'decomposition' 
                        ? '🔢 Descompone el número en sus valores posicionales'
                        : '➕ Suma los valores para formar el número'
                    }
                </p>
            </header>

            <div className="game-play-area">
                {/* Pregunta principal */}
                <div className="desco-question-card">
                    {question.type === 'decomposition' ? (
                        <div className="question-number">
                            {formatNumber(question.number)}
                        </div>
                    ) : (
                        <div className="question-decomposition-text">
                            {question.decomposition.join(' + ')}
                        </div>
                    )}
                </div>

                {/* Sección de respuesta */}
                <div className="answer-card">
                    <p className="answer-instruction">
                        {question.type === 'decomposition' 
                            ? 'Escribe la descomposición:'
                            : 'Escribe el número:'
                        }
                    </p>

                    <form onSubmit={handleSubmit} className="answer-form">
                        <input
                            type="text"
                            className="answer-input-styled"
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            placeholder={
                                question.type === 'decomposition' 
                                    ? 'Ej: 2000 + 300 + 40 + 7'
                                    : 'Escribe el número completo'
                            }
                        />
                    </form>

                    <div className="desco-button-group">
                        <button
                            onClick={onCheckAnswer}
                            disabled={!userAnswer.trim()}
                            className="btn-verify"
                            title="Verificar respuesta"
                        >
                            ✓ Verificar
                        </button>
                        
                        <button
                            onClick={() => onAnswerChange('')}
                            className="btn-clear"
                            title="Limpiar respuesta"
                        >
                            ↺ Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Pista permanente */}
            <div className="permanent-hint">
                <div className="permanent-hint-header">
                    <span className="hint-icon">💡</span>
                    <h4>Ayuda</h4>
                </div>
                <div className="permanent-hint-content">
                    <p className="hint-text">
                        {question.type === 'decomposition' 
                            ? 'Separa cada cifra según su valor posicional (unidades, decenas, centenas, etc.)'
                            : 'Suma todos los números para obtener el resultado final'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GameScreen;