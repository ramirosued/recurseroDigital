import React from 'react';

const HintModal = ({ hint, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="hint-icon">
                    💡
                </div>
                
                <h3 className="hint-title">
                    Pista Útil
                </h3>
                
                <p className="hint-text">
                    {hint}
                </p>
                
                <button 
                    className="btn btn-hint-close"
                    onClick={onClose}
                >
                    ✅ Entendido
                </button>
            </div>
        </div>
    );
};

export default HintModal;