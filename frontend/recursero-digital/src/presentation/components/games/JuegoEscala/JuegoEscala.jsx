import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './JuegoEscala.css';

import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import FeedbackModal from './FeedbackModal';
import CongratsModal from './CongratsModal';
import HintModal from '../../shared/HintModal';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels, transformToEscalaFormat } from '../../../../hooks/useGameLevels';
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';
import { getTotalActivitiesForLevel } from '../../../../utils/gameLevels';

import { 
    GAME_CONFIG, 
    MESSAGES, 
    UI_STATES,
    calculateActivityScore,
    getRandomMessage,
    createAnteriorPosteriorQuestion,
    getProgressiveHint
} from './util';

const JuegoEscala = () => {
    const { unlockLevel, getLastActivity } = useUserProgress();
    const { 
        points, 
        attempts, 
        incrementAttempts, 
        resetAttempts, 
        resetScoring, 
        completeActivity,
        startActivityTimer
    } = useGameScoring();
    
    const [gameState, setGameState] = useState(UI_STATES.GAME_STATES.START);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentActivity, setCurrentActivity] = useState(0);
    const [userAnswers, setUserAnswers] = useState({ anterior: '', posterior: '' });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState({ title: '', text: '', isCorrect: false });
    const [isValidationError, setIsValidationError] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [inputErrors, setInputErrors] = useState({ anterior: false, posterior: false });
    const [errorNotification, setErrorNotification] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { levels: backendLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.ESCALA, true);
    
    const levels = useMemo(() => transformToEscalaFormat(backendLevels), [backendLevels]);
    
    const totalQuestions = useMemo(() => {
        return getTotalActivitiesForLevel(backendLevels, currentLevel, GAME_CONFIG.TOTAL_QUESTIONS);
    }, [backendLevels, currentLevel]);

    useEffect(() => {
        AOS.init();
    }, []);

    const generateQuestions = useCallback((level, questionsCount) => {
        const newQuestions = [];
        const levelConfig = levels[level];
        for (let i = 0; i < questionsCount; i++) {
            newQuestions.push(createAnteriorPosteriorQuestion(levelConfig));
        }
        return newQuestions;
    }, [levels]);

    const handleStartGame = useCallback(() => {
        setGameState(UI_STATES.GAME_STATES.LEVEL_SELECT);
    }, []);

    const handleSelectLevel = useCallback((level, forceReset = false) => {
        const questionsCount = getTotalActivitiesForLevel(backendLevels, level, GAME_CONFIG.TOTAL_QUESTIONS);
        const newQuestions = generateQuestions(level, questionsCount);
        
        setCurrentLevel(level);
        
        let startingActivity = 0;
        
        if (!forceReset) {
            const lastActivity = getLastActivity(PROGRESS_KEYS.ESCALA);

            if (lastActivity && lastActivity.level === level + 1) {
                const lastActivityIndex = lastActivity.activity - 1;
                if (lastActivityIndex + 1 < questionsCount) {
                    startingActivity = lastActivityIndex + 1;
                }
            }
        } 

        setCurrentActivity(startingActivity);
        setUserAnswers({ anterior: '', posterior: '' });
        setShowFeedback(false);
        setIsValidationError(false);
        setQuestions(newQuestions);
        setCurrentQuestion(startingActivity < newQuestions.length ? newQuestions[startingActivity] : newQuestions[0]);
        setInputErrors({ anterior: false, posterior: false });
        setIsProcessing(false);
        
        resetScoring(); // Reinicia el puntaje global del nivel a 0
        resetAttempts();
        startActivityTimer();
        setGameState(UI_STATES.GAME_STATES.PLAYING);
    }, [generateQuestions, resetScoring, resetAttempts, startActivityTimer, getLastActivity, backendLevels]);

    useEffect(() => {
        if (gameState === UI_STATES.GAME_STATES.PLAYING && questions.length > 0 && currentActivity < questions.length) {
            setCurrentQuestion(questions[currentActivity]);
            setUserAnswers({ anterior: '', posterior: '' });
            setInputErrors({ anterior: false, posterior: false });
            setIsProcessing(false);
            resetAttempts();
            startActivityTimer();
        }
    }, [gameState, currentActivity, questions, resetAttempts, startActivityTimer]);

    const handleCheckAnswer = useCallback(() => {
        if (!currentQuestion || isProcessing) return;

        if (!userAnswers.anterior || !userAnswers.posterior) {
            setIsValidationError(true);
            setFeedback({
                title: '⚠️ Campos incompletos',
                text: MESSAGES.VALIDATION_ERRORS.INCOMPLETE_FIELDS,
                isCorrect: false
            });
            setShowFeedback(true);
            return;
        }

        setIsProcessing(true);
        setIsValidationError(false);
        incrementAttempts();
        const currentAttempts = attempts + 1;
        
        const anteriorCorrect = parseInt(userAnswers.anterior) === currentQuestion.correctAnterior;
        const posteriorCorrect = parseInt(userAnswers.posterior) === currentQuestion.correctPosterior;
        const isCorrect = anteriorCorrect && posteriorCorrect;

        if (isCorrect) {
            try {
                const activityScore = calculateActivityScore(currentLevel, currentAttempts);
                completeActivity(
                    currentLevel, 
                    GAME_IDS.ESCALA, 
                    currentActivity, 
                    currentLevel
                );
                
                const randomMessage = getRandomMessage(MESSAGES.SUCCESS);
                
                setFeedback({
                    title: `🎉 ${randomMessage}`,
                    text: `¡Correcto! Sumas ${activityScore} puntos.`,
                    isCorrect: true
                });
            } catch (error) {
                console.error('Error al guardar puntaje:', error);
                setErrorNotification('No se pudo guardar el progreso, pero puedes continuar jugando');
                
                const randomMessage = getRandomMessage(MESSAGES.SUCCESS);
                setFeedback({
                    title: `🎉 ${randomMessage}`,
                    text: `¡Respuesta correcta! Continúa con la siguiente actividad.`,
                    isCorrect: true
                });
            }
        } else {
            // Si es incorrecto, el modal NO mostrará el botón "Siguiente"
            const progressiveHint = getProgressiveHint(currentAttempts, currentQuestion);
            
            setFeedback({
                title: '❌ Respuesta incorrecta',
                text: `${progressiveHint}. Inténtalo de nuevo.`,
                isCorrect: false
            });
        }

        setShowFeedback(true);
    }, [currentQuestion, userAnswers, incrementAttempts, currentLevel, attempts, completeActivity, currentActivity, totalQuestions, isProcessing]);
    
    const handleContinue = useCallback(() => {
        setShowFeedback(false);
        setUserAnswers({ anterior: '', posterior: '' });
        setInputErrors({ anterior: false, posterior: false });
        setIsProcessing(false);
        
        if (currentActivity + 1 >= totalQuestions) {
            if (currentLevel < levels.length - 1) {
                unlockLevel(PROGRESS_KEYS.ESCALA, currentLevel + 2);

            }
            setShowCongrats(true);
        } else {
            setCurrentActivity(prev => prev + 1);
            startActivityTimer();
        }
    }, [currentActivity, totalQuestions, currentLevel, unlockLevel, startActivityTimer, levels.length]);

    const handleCloseFeedback = useCallback(() => {
        setShowFeedback(false);
        setIsValidationError(false);
        setInputErrors({ anterior: false, posterior: false });
        setIsProcessing(false); 
    }, []);

    const handleNextLevel = useCallback(() => {
        setShowCongrats(false);
        if (currentLevel < levels.length - 1) {
            handleSelectLevel(currentLevel + 1);
        } else {
            setGameState(UI_STATES.GAME_STATES.LEVEL_SELECT);
        }
    }, [currentLevel, handleSelectLevel, levels.length]);

    const handleBackToLevels = useCallback(() => {
        setShowCongrats(false);
        setGameState(UI_STATES.GAME_STATES.LEVEL_SELECT);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setShowCongrats(false);
        handleSelectLevel(currentLevel, true);
    }, [currentLevel, handleSelectLevel]);

    if (levelsLoading) {
        return <div className="game-wrapper bg-space-gradient"><div>Cargando niveles...</div></div>;
    }

    return (
        <div className="game-wrapper bg-space-gradient">
            {errorNotification && (
                <div className="error-notification">
                    <div className="error-notification-text">
                        ⚠️ {errorNotification}
                    </div>
                    <button 
                        onClick={() => setErrorNotification('')}
                        className="error-notification-close"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {gameState === UI_STATES.GAME_STATES.START && (
                <StartScreen onStart={handleStartGame} />
            )}
            
            {gameState === UI_STATES.GAME_STATES.LEVEL_SELECT && (
                <LevelSelectScreen 
                    levels={levels}
                    onSelectLevel={(level) => handleSelectLevel(level, false)}
                />
            )}
            
            {gameState === UI_STATES.GAME_STATES.PLAYING && currentQuestion && (
                <GameScreen
                    activity={currentActivity + 1}
                    totalActivities={totalQuestions}
                    points={points}
                    attempts={attempts}
                    question={currentQuestion}
                    userAnswers={userAnswers}
                    onAnswersChange={setUserAnswers}
                    onCheckAnswer={() => handleCheckAnswer()}
                    onBackToLevels={handleBackToLevels}
                    level={currentLevel + 1}
                    levelConfig={levels[currentLevel]}
                    inputErrors={inputErrors}
                    setInputErrors={setInputErrors}
                    isProcessing={isProcessing}
                />
            )}

            {showFeedback && (
                <FeedbackModal
                    feedback={feedback}
                    onNext={handleContinue}
                    onClose={handleCloseFeedback}
                    isValidationError={isValidationError}
                    isLastQuestion={currentActivity >= totalQuestions - 1}
                />
            )}

            {showCongrats && (
                <CongratsModal
                    score={points}
                    totalQuestions={totalQuestions * GAME_CONFIG.BASE_SCORE * (currentLevel + 1)}
                    levelName={levels[currentLevel].name}
                    nextLevelUnlocked={currentLevel < levels.length - 1}
                    onPlayAgain={handlePlayAgain}
                    onBackToLevels={handleBackToLevels}
                />
            )}

            {showHint && currentQuestion && (
                <HintModal
                    hint={currentQuestion.hint}
                    onClose={() => setShowHint(false)}
                    theme="escala"
                    title="Pista Útil"
                    icon="💡"
                    buttonText="✅ Entendido"
                />
            )}
        </div>
    );
};

export default JuegoEscala;