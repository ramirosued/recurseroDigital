import React from "react";
import "../../styles/pages/addUserForm.css";

export default function DeleteCourseForm({ onClose, onConfirm, course }) {
  const handleConfirm = () => {
    onConfirm(course);
  };

  return (
    <div className="add-user-overlay">
      <div className="add-user-modal">
        <div className="modal-header">
          <h2>Eliminar Curso</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-form">
          <div className="form-group">
            <p style={{ 
              fontSize: '1rem', 
              color: '#2d3748', 
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              ¿Estás seguro de que deseas eliminar el curso <strong>"{course?.name}"</strong>?
            </p>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#e53e3e', 
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="button" 
              className="submit-btn" 
              onClick={handleConfirm}
              style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}
            >
              Eliminar Curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

