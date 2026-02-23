import React from 'react';

const FeedbackModal = ({ feedback, onContinue }) => (
    <div className="modal-overlay">
        <div className="paper-note modal-content" data-aos="zoom-in">
            <h3 className={feedback.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}>
                {feedback.title}
            </h3>
            <p>{feedback.text}</p>
            <button onClick={onContinue} className="btn btn-continue">
                Continuar
            </button>
        </div>
    </div>
);

export default FeedbackModal;