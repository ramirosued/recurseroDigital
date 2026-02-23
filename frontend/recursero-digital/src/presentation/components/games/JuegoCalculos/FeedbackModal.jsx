import React from 'react';

const FeedbackModal = ({ 
  isVisible, 
  isCorrect, 
  message, 
  pointsEarned, 
  correctAnswer,
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-3xl p-8 max-w-md w-full text-center transform transition-all duration-300 ${
        isCorrect 
          ? 'border-4 border-green-400 shadow-green-400/50' 
          : 'border-4 border-red-400 shadow-red-400/50'
      } shadow-2xl`}>
        
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isCorrect 
            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
            : 'bg-gradient-to-r from-red-400 to-pink-500'
        }`}>
          <span className="text-4xl text-white">
            {isCorrect ? '✅' : '❌'}
          </span>
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-bold mb-4 ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}>
          {isCorrect ? '¡Correcto!' : '¡Incorrecto!'}
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-700 mb-4">
          {message}
        </p>

        {/* Points (only for correct answers) */}
        {isCorrect && pointsEarned && (
          <div className="bg-green-100 rounded-2xl p-4 mb-4">
            <div className="text-green-600 font-bold text-xl">
              +{pointsEarned} puntos
            </div>
            <div className="text-green-600 text-sm">
              ¡Excelente trabajo!
            </div>
          </div>
        )}

        {/* Correct Answer (only for incorrect answers) */}
        {!isCorrect && correctAnswer && (
          <div className="bg-red-100 rounded-2xl p-4 mb-4">
            <div className="text-red-600 text-sm mb-1">
              Respuesta correcta:
            </div>
            <div className="text-red-600 font-bold text-2xl">
              {correctAnswer}
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="text-gray-600 text-sm mb-6">
          {isCorrect ? (
            <>
              <span className="text-2xl">🎉</span>
              <br />
              ¡Sigue así, lo estás haciendo genial!
            </>
          ) : (
            <>
              <span className="text-2xl">💪</span>
              <br />
              ¡No te preocupes, sigue practicando!
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`btn-primary w-full py-3 ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600' 
              : 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;