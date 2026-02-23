import React, { useEffect, useRef } from 'react';

const FeedbackModal = ({ feedback, onContinue }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                onContinue();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onContinue]);

    return (
        <div className="modal-overlay">
            <div className="modal-content slide-in" data-aos="zoom-in">
                <div className="desco-feedback-icon">
                    {feedback.isCorrect ? '🎉' : '😢'}
                </div>
                
                <h3 className={`desco-feedback-title ${feedback.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                    {feedback.title}
                </h3>
                
                <p className="desco-feedback-text">
                    {feedback.text}
                </p>
                
                <div className="desco-feedback-button-container">
                    <button 
                        ref={buttonRef}
                        onClick={onContinue} 
                        className="btn btn-check desco-feedback-button"
                    >
                        {feedback.isCorrect ? '🚀 Continuar' : '🔄 Reintentar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;