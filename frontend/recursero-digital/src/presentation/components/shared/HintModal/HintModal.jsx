import React from 'react';
import './HintModal.css';

const HintModal = ({ 
    hint, 
    onClose, 
    theme = 'default',
    title = 'Pista Útil',
    icon = '💡',
    buttonText = '✅ Entendido'
}) => {
    return (
        <div className="modal-overlay">
            <div className={`hint-modal-content ${theme}`} data-aos="zoom-in">
                <div className="hint-modal-icon">
                    {icon}
                </div>
                
                <h3 className="hint-modal-title">
                    {title}
                </h3>
                
                <div className="hint-modal-box">
                    <p className="hint-modal-text">
                        {hint}
                    </p>
                </div>
                
                <div className="hint-modal-actions">
                    <button 
                        className={`btn hint-modal-button ${theme}`}
                        onClick={onClose}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HintModal;