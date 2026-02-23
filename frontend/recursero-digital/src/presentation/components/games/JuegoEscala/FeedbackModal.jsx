import React from 'react';

const FeedbackModal = ({ feedback, onNext, onClose, isLastQuestion, isValidationError }) => {
    const { isCorrect, title, text } = feedback;

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="feedback-icon">
                    {isValidationError ? '⚠️' : (isCorrect ? '🌟' : '❌')}
                </div>
                
                <h3 className="feedback-title">
                    {title}
                </h3>
                
                <p className="feedback-explanation">
                    {text}
                </p>
                
                <div className="feedback-actions">
                    {(isValidationError || !isCorrect) && (
                        <button 
                            className="btn-close btn-main-gradient bg-space-gradient"
                            onClick={onClose}
                        >
                            ✖️ Cerrar
                        </button>
                    )}
                    
                    {/* Botón siguiente pregunta (solo respuestas correctas) */}
                    {isCorrect && !isValidationError && (
                        <button 
                            className="btn-success btn-main-gradient bg-space-gradient"
                            onClick={onNext}
                        >
                            {isLastQuestion ? '🏁 Ver resultados' : '➡️ Siguiente pregunta'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;