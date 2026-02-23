import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getQuestionsForLevel, 
  validateAnswer, 
  getOperationName, 
  getLevelName,
  getRandomEncouragement,
  getRandomMotivation,
  getLevelNumber
} from './utils';

const GameScreen = ({ 
  operation, 
  level, 
  allLevels = [],
  onGameComplete, 
  onBackToLevelSelect,
  onUpdateScore,
  onUpdateAttempts,
  onActivityComplete,
  onStartActivityTimer
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0); // Attempts for current question
  const [totalAttempts, setTotalAttempts] = useState(0); // Total attempts for the entire game
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const inputRef = useRef(null);
  
  const backendLevelConfig = useMemo(() => {
    if (!allLevels || allLevels.length === 0) return null;
    
    const levelNumber = parseInt(level.replace('nivel', ''));
    const operationOffset = {
      suma: 0,
      resta: 3,
      multiplicacion: 6
    };
    
    const backendLevelNumber = levelNumber + operationOffset[operation];
    return allLevels.find(l => l.level === backendLevelNumber);
  }, [allLevels, operation, level]);
  
  // Generar preguntas usando la configuración del backend
  const questions = useMemo(() => {
    if (!backendLevelConfig) return [];
    const levelNumber = parseInt(level.replace('nivel', ''));
    return getQuestionsForLevel(operation, levelNumber, backendLevelConfig);
  }, [operation, level, backendLevelConfig]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowFeedback(false);
    setFeedbackMessage('');
    setFeedbackType('');
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setTotalAttempts(0);
    setCorrectAnswers(0);
  }, [operation, level, questions]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (currentQuestionIndex > 0 && onStartActivityTimer) {
      onStartActivityTimer();
    }
  }, [currentQuestionIndex, onStartActivityTimer]);

  const handleSubmitAnswer = () => {
    if (userAnswer.trim() === '' || isAnswerSubmitted) return;

    const userAnswerNum = parseInt(userAnswer);
    const isCorrect = validateAnswer(userAnswerNum, currentQuestion.respuesta);
    
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      const pointsEarned = calculatePoints();
      setScore(prev => prev + pointsEarned);
      const newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);
      onUpdateScore(pointsEarned);
      
      if (onActivityComplete) {
        const isLastActivity = isLastQuestion;
        onActivityComplete(currentQuestionIndex, attempts, 1, 1, isLastActivity);
      }
      
      setFeedbackMessage(`${getRandomEncouragement()} +${pointsEarned} puntos`);
      setFeedbackType('success');
      setShowFeedback(true);

      setTimeout(() => {
        if (isLastQuestion) {
          const finalScore = score + pointsEarned;
          const isWin = newCorrectAnswers >= Math.ceil(questions.length * 0.6);
          onGameComplete(isWin, finalScore, newCorrectAnswers, questions.length, totalAttempts);
        } else {
          nextQuestion();
        }
      }, 1500);
    } else {
      setAttempts(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      onUpdateAttempts();
      
      setFeedbackMessage(getRandomMotivation());
      setFeedbackType('error');
      setShowFeedback(true);

      setTimeout(() => {
        setUserAnswer('');
        setIsAnswerSubmitted(false);
        setShowFeedback(false);
      }, 2000);
    }
  };

  const calculatePoints = () => {
    const levelNumber = parseInt(level.replace('nivel', ''));
    const baseScore = 50 * levelNumber;
    const penalty = attempts * 10;
    return Math.max(10, baseScore - penalty);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setShowFeedback(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnswerSubmitted) {
      handleSubmitAnswer();
    }
  };

  if (!backendLevelConfig) {
    return (
      <div className="text-center text-white">
        <p>Cargando configuración del nivel...</p>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="text-center text-white">
        <p>Error: No se encontraron preguntas para este nivel.</p>
        <button onClick={onBackToLevelSelect} className="btn-secondary mt-4">
          Volver a Niveles
        </button>
      </div>
    );
  }

  return (
    <div className="game-content">
      <header className="desco-game-header">
        <div className="header-controls">
          <div className="buttons-group">
            <button 
              onClick={() => navigate('/alumno/juegos')}
              className="btn-back-to-dashboard"
              title="Volver a juegos"
            >
              ← Juegos
            </button>
            <button 
              onClick={onBackToLevelSelect}
              className="btn-back-to-levels"
              title="Volver a niveles"
            >
              ← Niveles
            </button>
          </div>
          
          <div className="game-status">
            <div className="status-item">
              <div className="status-icon">🏆</div>
              <div className="status-label">Nivel</div>
              <div className="status-value">{getLevelNumber(level)}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">📝</div>
              <div className="status-label">Actividad</div>
              <div className="status-value">{currentQuestionIndex + 1}/{questions.length}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">⭐</div>
              <div className="status-label">Puntos</div>
              <div className="status-value">{score}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">🎯</div>
              <div className="status-label">Intentos</div>
              <div className="status-value">{attempts}</div>
            </div>
          </div>
        </div>
        
        <h1 className="game-title">
          🧮 {getOperationName(operation)} - {getLevelName(level)}
        </h1>
        <p className="game-instruction">
          Resuelve la operación y escribe el resultado
        </p>
      </header>

      <div className="calculos-game-play-area">
        

        {/* Sección de respuesta */}
        <div className="answer-card">
          <div className="answer-section">
            <div className="calculation-display">
              <span className="question-text">{currentQuestion.pregunta.replace(' =', '')}</span>
            </div>
          <div className="equals-display">
            <span className="equals-sign">=</span>
          </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setUserAnswer(value);
              }}
              onKeyPress={handleKeyPress}
              disabled={isAnswerSubmitted}
              className="answer-input-styled"
              placeholder="Tu respuesta"
            />
          </div>

          <div className="calculos-button-group">
            <button
              onClick={handleSubmitAnswer}
              disabled={userAnswer.trim() === '' || isAnswerSubmitted}
              className="btn-verify"
              title="Verificar respuesta"
            >
              {isAnswerSubmitted ? '⏳ Enviado' : '✓ Verificar'}
            </button>
            
            <button
              onClick={() => setUserAnswer('')}
              className="btn-clear"
              title="Limpiar respuesta"
              disabled={isAnswerSubmitted}
            >
              ↺ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Feedback y pista */}
      {showFeedback && (
        <div className={`feedback-message ${feedbackType === 'success' ? 'feedback-success' : 'feedback-error'}`}>
          {feedbackMessage}
        </div>
      )}

      {/* Pista permanente */}
      <div className="permanent-hint">
        <div className="permanent-hint-header">
          <span className="hint-icon">💡</span>
          <h4>Ayuda</h4>
        </div>
        <div className="permanent-hint-content">
          <p className="hint-text">
            Presiona Enter para enviar tu respuesta rápidamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;