import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../../styles/globals/games.css';
import './JuegoEscritura.css';
import { generateDragDropActivity, validateNumberWordPair } from './utils';
import { transformToEscrituraFormat } from '../../../../hooks/useGameLevels'; 
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';
import { getTotalActivitiesForLevel } from '../../../../utils/gameLevels';
import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import FeedbackModal from './FeedbackModal';
import CongratsModal from './CongratsModal';
import ErrorPopup from './ErrorPopup';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels } from '../../../../hooks/useGameLevels';

const JuegoEscritura = () => {
    const { unlockLevel, getMaxUnlockedLevel, getLastActivity } = useUserProgress();
    const { 
        points, 
        attempts, 
        incrementAttempts, 
        resetAttempts, 
        resetScoring, 
        completeActivity,
        startActivityTimer,
        isSubmitting,
        submitError 
    } = useGameScoring();
    
    const [gameState, setGameState] = useState('start');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentActivity, setCurrentActivity] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const [wordPairs, setWordPairs] = useState([]);
    const [dragAnswers, setDragAnswers] = useState({});
    const [usedNumbers, setUsedNumbers] = useState(new Set());
    const [feedback, setFeedback] = useState({ title: '', text: '', isCorrect: false });
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const lastGeneratedActivity = useRef({ level: -1, activity: -1 });
    
    const { levels: backendLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.ESCRITURA, true);
    const levels = useMemo(() => transformToEscrituraFormat(backendLevels), [backendLevels]);
    
    
    const totalActivities = useMemo(() => {
        return getTotalActivitiesForLevel(backendLevels, currentLevel, 5);
    }, [backendLevels, currentLevel]);
    
    useEffect(() => { 
        AOS.init(); 
    }, []);
    
    const startNewActivity = useCallback(() => {
        if (backendLevels.length === 0 || currentLevel < 0 || currentLevel >= backendLevels.length) {
            return;
        }
        
        const levelConfig = {
            min: backendLevels[currentLevel]?.config?.min || 1,
            max: backendLevels[currentLevel]?.config?.max || 50
        };
        
        const activityData = generateDragDropActivity(currentLevel, levelConfig);
        setNumbers(activityData.numbers);
        setWordPairs(activityData.wordPairs);
        setDragAnswers({});
        setUsedNumbers(new Set());
        resetAttempts();
    }, [currentLevel, backendLevels, resetAttempts]);
    
    useEffect(() => {
        if (gameState === 'game' && backendLevels.length > 0 && currentLevel >= 0 && currentLevel < backendLevels.length) {
            const activityKey = `${currentLevel}-${currentActivity}`;
            const lastKey = `${lastGeneratedActivity.current.level}-${lastGeneratedActivity.current.activity}`;
            
            if (activityKey !== lastKey) {
                const levelConfig = {
                    min: backendLevels[currentLevel]?.config?.min || 1,
                    max: backendLevels[currentLevel]?.config?.max || 50
                };
                
                const activityData = generateDragDropActivity(currentLevel, levelConfig);
                setNumbers(activityData.numbers);
                setWordPairs(activityData.wordPairs);
                setDragAnswers({});
                setUsedNumbers(new Set());
                resetAttempts();
                startActivityTimer();
                
                lastGeneratedActivity.current = { level: currentLevel, activity: currentActivity };
            }
        }
    }, [gameState, currentActivity, currentLevel, backendLevels, resetAttempts, startActivityTimer]);
    
    const handleStartGame = useCallback((level) => {
        const selectedLevelIndex = level - 1;
        setCurrentLevel(selectedLevelIndex);
        
        const lastActivity = getLastActivity(PROGRESS_KEYS.ESCRITURA);
        
        let startingActivity = 0;
        const levelActivities = backendLevels[selectedLevelIndex]?.activitiesCount || 5;
        
        if (lastActivity && lastActivity.level === level) {
            const lastActivityIndex = lastActivity.activity - 1;
            
            if (lastActivityIndex + 1 < levelActivities) {
                startingActivity = lastActivityIndex + 1;
            } else {
                startingActivity = 0;
            }
        } else {
            startingActivity = 0;
        }
        
        setCurrentActivity(startingActivity);
        resetScoring();
        setGameState('game');
    }, [resetScoring, getLastActivity, backendLevels]);
    
    const handleDragStart = (e, number) => {
        e.dataTransfer.setData('text/plain', number.toString());
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, wordPairIndex) => {
        e.preventDefault();
        const draggedNumber = parseInt(e.dataTransfer.getData('text/plain'));
        const targetWordPair = wordPairs[wordPairIndex];
        const isCorrect = validateNumberWordPair(draggedNumber, targetWordPair.word);
        
        if (isCorrect) {
            const currentNumber = dragAnswers[wordPairIndex];
            if (currentNumber) {
                setUsedNumbers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentNumber);
                    return newSet;
                });
            }
            
            setUsedNumbers(prev => new Set([...prev, draggedNumber]));
            
            setDragAnswers(prev => ({
                ...prev,
                [wordPairIndex]: draggedNumber
            }));
        } else {
            incrementAttempts();
            setShowErrorPopup(true);
        }
    };
    
    const handleNextLevel = useCallback(() => {
        if (currentLevel >= backendLevels.length - 1) {
            setGameState('level-select');
        } else {
            const nextLevel = currentLevel + 1;
            setCurrentLevel(nextLevel);
            setCurrentActivity(0);
            resetScoring();
            setGameState('game');
        }
    }, [currentLevel, backendLevels.length, resetScoring]);

    const handleCheckAnswer = async () => {
        const allAnswersProvided = wordPairs.every((_, index) => dragAnswers[index] !== undefined);
        
        if (!allAnswersProvided) {
            setFeedback({ 
                title: '⚠️ Faltan respuestas', 
                text: 'Por favor completa todos los campos antes de verificar.', 
                isCorrect: false 
            });
            setGameState('feedback');
            return;
        }
        let correctCount = 0;
        let incorrectAnswers = [];

        wordPairs.forEach((wordPair, index) => {
            const userAnswer = dragAnswers[index];
            const isCorrect = validateNumberWordPair(userAnswer, wordPair.word);
            
            if (isCorrect) {
                correctCount++;
            } else {
                incorrectAnswers.push(`${userAnswer} → ${wordPair.word}`);
            }
        });

        const allCorrect = correctCount === wordPairs.length;

        if (allCorrect) {
            const activityScore = await completeActivity(currentLevel, GAME_IDS.ESCRITURA, currentActivity, currentLevel);
            
            const levelActivities = backendLevels[currentLevel]?.activitiesCount || 5;
            if (currentActivity < levelActivities - 1) {
                setFeedback({ 
                    title: '✅ ¡Perfecto!', 
                    text: `¡Excelente! Todas las respuestas son correctas. Ganaste ${activityScore} puntos. Avanza a la siguiente actividad.`, 
                    isCorrect: true 
                });
                setGameState('feedback');
            } else {
                unlockLevel(PROGRESS_KEYS.ESCRITURA, currentLevel + 2);
                setGameState('congrats');
            }
        } else {
            setFeedback({ 
                title: '❌ Algunas respuestas incorrectas', 
                text: `Tienes ${correctCount}/${wordPairs.length} correctas. Revisa las respuestas marcadas.`, 
                isCorrect: false 
            });
            setGameState('feedback');
        }
    };
    
    const handleRemoveNumber = (wordPairIndex) => {
        const numberToRemove = dragAnswers[wordPairIndex];
        if (numberToRemove) {
            setUsedNumbers(prev => {
                const newSet = new Set(prev);
                newSet.delete(numberToRemove);
                return newSet;
            });
            
            setDragAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[wordPairIndex];
                return newAnswers;
            });
        }
    };



    
    const handleContinue = () => {
        if (feedback.isCorrect) {
            setCurrentActivity(prev => prev + 1);
            startActivityTimer();
        }
        setGameState('game');
    };

    const handleCloseErrorPopup = useCallback(() => {
        setShowErrorPopup(false);
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
            {gameState === 'start' && <StartScreen onStart={() => setGameState('level-select')} />}
            
            {gameState === 'level-select' && <LevelSelectScreen levels={levels} onSelectLevel={handleStartGame} />}
            
            {gameState === 'game' && <GameScreen
                level={currentLevel + 1}
                activity={currentActivity + 1}
                totalActivities={totalActivities}
                points={points}
                attempts={attempts}
                numbers={numbers}
                wordPairs={wordPairs}
                dragAnswers={dragAnswers}
                usedNumbers={usedNumbers}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onRemoveNumber={handleRemoveNumber}
                onCheck={handleCheckAnswer}
                onBackToLevels={() => setGameState('level-select')}
            />}
            
            {gameState === 'feedback' && <FeedbackModal feedback={feedback} onContinue={handleContinue} />}
            
            {gameState === 'congrats' && <CongratsModal 
                level={currentLevel + 1} 
                points={points} 
                onNextLevel={handleNextLevel}
                onBackToLevels={() => setGameState('level-select')}
            />}
            
            <ErrorPopup show={showErrorPopup} onClose={handleCloseErrorPopup} />

        </div>
    );
};

export default JuegoEscritura;
