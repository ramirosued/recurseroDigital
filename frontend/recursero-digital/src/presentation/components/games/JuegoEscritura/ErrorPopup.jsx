import React, { useEffect } from 'react';

const ErrorPopup = ({ show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="error-popup-overlay">
            <div className="error-popup" data-aos="fade-in" data-aos-duration="300">
                <div className="error-icon">❌</div>
                <h3>¡Intenta de nuevo!</h3>
                <p>Esa combinación no es correcta</p>
            </div>
        </div>
    );
};

export default ErrorPopup;