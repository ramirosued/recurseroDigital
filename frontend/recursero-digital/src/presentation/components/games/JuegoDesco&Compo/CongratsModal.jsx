import React from 'react';

const CongratsModal = ({ level, points, hasNextLevel, onNextLevel, onBackToLevels }) => (
    <div className="modal-overlay">
        <div className="modal-content congrats slide-in" data-aos="zoom-in">
            <div style={{
                fontSize: '4rem',
                textAlign: 'center',
                marginBottom: '1rem'
            }}>
                🌟
            </div>
            
            <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '1rem',
                color: '#92400e',
                fontFamily: 'Playfair Display, serif'
            }}>
                ¡Felicidades!
            </h2>
            
            <p style={{
                fontSize: '1.2rem',
                textAlign: 'center',
                marginBottom: '1rem',
                color: '#a16207',
                fontWeight: '600'
            }}>
                ¡Completaste el Nivel {level}!
            </p>
            
            <div style={{
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#92400e',
                    margin: 0,
                    fontWeight: '600'
                }}>
                    Puntos totales: {points} 🎯
                </p>
            </div>
            
            {hasNextLevel && (
                <p style={{
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    color: '#059669',
                    fontWeight: '600'
                }}>
                    🎉 ¡Desbloqueaste el siguiente nivel! 🎉
                </p>
            )}
            
            <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                {hasNextLevel && (
                    <button 
                        onClick={onNextLevel} 
                        className="btn btn-start"
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 20%, #6366f1 40%, #8b5cf6 60%, #7c3aed 80%, #5b21b6 100%)',
                            padding: '0.75rem 1.5rem'
                        }}
                    >
                        🚀 Siguiente Nivel
                    </button>
                )}
                
                <button 
                    onClick={onBackToLevels} 
                    className="btn btn-check"
                    style={{
                        padding: '0.75rem 1.5rem'
                    }}
                >
                    📋 Ver Niveles
                </button>
            </div>
        </div>
    </div>
);

export default CongratsModal;