import React from 'react';

const FeedbackModal = ({ isSuccess, onContinue, /*onRetry*/ }) => {
    const getRandomErrorMessage = () => {
        const messages = [
            "¡Intenta de nuevo!",
            "¡No te rindas!",
            "¡Casi lo tienes!",
            "¡Inténtalo otra vez!",
            "¡Tú puedes!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const getRandomErrorDescription = () => {
        const descriptions = [
            "El orden no es correcto. ¡No te rindas, tú puedes!",
            "Revisa el orden de los números. ¡Sigue intentando!",
            "Algo no está bien con el orden. ¡Vamos, inténtalo de nuevo!",
            "El ordenamiento no es el correcto. ¡Tú tienes la capacidad!",
            "Fíjate bien en los números. ¡El siguiente intento será el bueno!"
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };
    
    if (isSuccess) {
        return (
            <div className="activity-feedback-overlay">
                <div className="activity-feedback-modal success">
                    <h2>🎉 ¡Bien Hecho!</h2>
                    <p>¡Pasaste al siguiente nivel!</p>
                    <button onClick={onContinue} className="btn btn-success">
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="activity-feedback-overlay">
            <div className="activity-feedback-modal error">
                <h2>🤔 {getRandomErrorMessage()}</h2>
                <p>{getRandomErrorDescription()}</p>
            </div>
        </div>
    );
};

export default FeedbackModal;