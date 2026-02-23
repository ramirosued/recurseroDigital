import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../../styles/globals/games.css';
import './JuegoDescomposicion.css';

import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import FeedbackModal from './FeedbackModal';
import CongratsModal from './CongratsModal';
import HintModal from '../../shared/HintModal';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels, transformToDescomposicionFormat } from '../../../../hooks/useGameLevels';
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';
import { getTotalActivitiesForLevel } from '../../../../utils/gameLevels';

const JuegoDescomposicion = () => {
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

    const [gameMode, setGameMode] = useState(null); // 'decomposition' o 'composition'
    
    const [gameState, setGameState] = useState('start');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentActivity, setCurrentActivity] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState({ title: '', text: '', isCorrect: false });
    const [questions, setQuestions] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);

    const { levels: backendLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.DESCOMPOSICION, true);

    const levels = useMemo(() => transformToDescomposicionFormat(backendLevels), [backendLevels]);

    const totalQuestions = useMemo(() => {
        return getTotalActivitiesForLevel(backendLevels, currentLevel, 5);
    }, [backendLevels, currentLevel]);

    useEffect(() => {
        AOS.init();
    }, []);

    const generateNumber = useCallback((level) => {
        const levelConfig = levels[level];
        return Math.floor(Math.random() * (levelConfig.max - levelConfig.min + 1)) + levelConfig.min;
    }, [levels]);

    const decomposeNumber = useCallback((num) => {
        const str = num.toString();
        let decomposition = [];
        
        for (let i = 0; i < str.length; i++) {
            const digit = parseInt(str[i]);
            const placeValue = Math.pow(10, str.length - 1 - i);
            const value = digit * placeValue;
            if (value > 0) {
                decomposition.push(value);
            }
        }
        
        return decomposition;
    }, []);

    const generateQuestions = useCallback((level, questionsCount) => {
        const newQuestions = [];
        
        for (let i = 0; i < questionsCount; i++) {
            const typeToUse = gameMode || (Math.random() > 0.5 ? 'decomposition' : 'composition');
            
            const number = generateNumber(level);
            const decomposition = decomposeNumber(number);
            
            if (typeToUse === 'decomposition') {
                newQuestions.push({
                    type: 'decomposition',
                    number: number,
                    correctAnswer: decomposition,
                    hint: "Cada cifra ocupa un lugar: unidades, decenas, centenas, miles"
                });
            } else {
                newQuestions.push({
                    type: 'composition',
                    decomposition: decomposition,
                    correctAnswer: number,
                    hint: "Suma todos los números para obtener el resultado"
                });
            }
        }
        
        return newQuestions;
    }, [generateNumber, decomposeNumber, gameMode]); // Agregada dependencia gameMode

    const handleStartGame = useCallback((selectedMode) => {
        setGameMode(selectedMode);
        setGameState('levelSelect');
    }, []);

    const handleBackToStart = useCallback(() => {
        resetGame();
        setGameState('start');
      }, []);
    
      const resetGame = useCallback(() => {
        setCurrentLevel(0);
        setCurrentActivity(0);
        resetScoring();
        setShowFeedback(false);
      }, [resetScoring]);

    const handleSelectLevel = useCallback((level) => {
        setCurrentLevel(level);

        const startingActivity = 0;
        setCurrentActivity(startingActivity);
        
        // Aquí usamos backendLevels para saber cuántas preguntas tiene este nivel
        const questionsCount = backendLevels[level]?.activitiesCount || 5;
        
        setQuestions(generateQuestions(level, questionsCount));
        resetScoring();
        resetAttempts();
        setGameState('playing');
        
    }, [generateQuestions, resetScoring, resetAttempts, backendLevels]);

    useEffect(() => {
        if (gameState === 'playing' && questions.length > 0) {
            setCurrentQuestion(questions[currentActivity]);
            setUserAnswer('');
            setIsAnswered(false);
            startActivityTimer();
        }
    }, [gameState, currentActivity, questions, startActivityTimer]);

    const handleCheckAnswer = useCallback(() => {
        if (!currentQuestion || !userAnswer.trim() || isAnswered) return;

        incrementAttempts();
        let isCorrect = false;

        if (currentQuestion.type === 'decomposition') {
            const userParts = userAnswer.split('+').map(part => parseInt(part.trim())).filter(n => !isNaN(n));
            const correctParts = currentQuestion.correctAnswer;
            isCorrect = JSON.stringify(userParts.sort((a, b) => a - b)) ===
                    JSON.stringify(correctParts.sort((a, b) => a - b));
        } else {
            isCorrect = parseInt(userAnswer) === currentQuestion.correctAnswer;
        }

        if (isCorrect) {
            const activityScore = 50 * (currentLevel + 1);
            completeActivity(currentLevel, GAME_IDS.DESCOMPOSICION, currentActivity, currentLevel);

            setIsAnswered(true);
            setFeedback({
                title: '¡Correcto!',
                text: `¡Excelente! Ganaste ${activityScore} puntos`,
                isCorrect: true
            });
        } else {
            setFeedback({
                title: '¡Incorrecto!',
                text: `¡Inténtalo de nuevo! Revisa tu respuesta y vuelve a intentarlo.`,
                isCorrect: false
            });
        }

    setShowFeedback(true);
    }, [currentQuestion, userAnswer, incrementAttempts, currentLevel, attempts, completeActivity, isAnswered]);

    const handleContinue = useCallback(() => {
    setShowFeedback(false);
    
        if (feedback.isCorrect) {
            if (currentActivity + 1 >= totalQuestions) {
                if (currentLevel < levels.length - 1) {
                    unlockLevel(PROGRESS_KEYS.DESCOMPOSICION, currentLevel + 2);
                }
                setShowCongrats(true);
            } else {
                setCurrentActivity(prev => prev + 1);
                resetAttempts();
                startActivityTimer();
            }
        }


    }, [feedback.isCorrect, currentActivity, totalQuestions, currentLevel, unlockLevel, resetAttempts, startActivityTimer, levels.length]);

    const handleNextLevel = useCallback(() => {
        setShowCongrats(false);
        if (currentLevel < levels.length - 1) {
            handleSelectLevel(currentLevel + 1);
        } else {
            setGameState('levelSelect');
        }
    }, [currentLevel, handleSelectLevel, levels.length]);

    const handleBackToLevels = useCallback(() => {
        setShowCongrats(false);
        setGameState('levelSelect');
    }, []);

    const handleShowHint = useCallback(() => {
        setShowHint(true);
    }, []);

    const formatNumber = useCallback((num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }, []);

    if (levelsLoading) {
        return (
            <div className="game-wrapper bg-space-gradient">
                <div>Cargando niveles...</div>
            </div>
        );
    }

    return (
        <div className="game-wrapper bg-space-gradient">

            {gameState === 'start' && (
                <StartScreen onStart={handleStartGame} />
            )}
            
            {gameState === 'levelSelect' && (
                <LevelSelectScreen 
                    levels={levels}
                    onSelectLevel={handleSelectLevel}
                    onBackToStart={handleBackToStart}
                />
            )}
            
            {gameState === 'playing' && currentQuestion && (
                <GameScreen
                    level={currentLevel + 1}
                    activity={currentActivity + 1}
                    totalActivities={totalQuestions}
                    points={points}
                    attempts={attempts}
                    question={currentQuestion}
                    userAnswer={userAnswer}
                    onAnswerChange={setUserAnswer}
                    onCheckAnswer={handleCheckAnswer}
                    onShowHint={handleShowHint}
                    onBackToLevels={handleBackToLevels}
                    formatNumber={formatNumber}
                />
            )}

            {showFeedback && (
                <FeedbackModal
                    feedback={feedback}
                    onContinue={handleContinue}
                />
            )}

            {showCongrats && (
                <CongratsModal
                    level={currentLevel + 1}
                    points={points}
                    hasNextLevel={currentLevel < levels.length - 1}
                    onNextLevel={handleNextLevel}
                    onBackToLevels={handleBackToLevels}
                />
            )}

            {showHint && currentQuestion && (
                <HintModal
                    hint={currentQuestion.hint}
                    onClose={() => setShowHint(false)}
                    theme="descomposicion"
                    title="¡Aquí tienes una pista!"
                    icon="💡"
                    buttonText="✨ ¡Entendido!"
                />
            )}
        </div>
    );
};


export default JuegoDescomposicion;