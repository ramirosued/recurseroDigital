import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import "../../../styles/globals/games.css";
import "./JuegoOrdenamiento.css";
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';
import { getTotalActivitiesForLevel } from '../../../../utils/gameLevels';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels, transformToOrdenamientoFormat } from '../../../../hooks/useGameLevels';
import { 
  getNumbersForActivity,
  checkOrder, 
  generateHint
} from './utils';

import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import GameCompleteScreen from './GameCompleteScreen';
import CongratsModal from './CongratsModal';
import FeedbackModal from './FeedbackModal';

const JuegoOrdenamiento = () => {
  const navigate = useNavigate();
  const { unlockLevel, getLastActivity } = useUserProgress();
  const { 
    points, 
    attempts, 
    incrementAttempts, 
    resetScoring, 
    completeActivity,
    startActivityTimer
  } = useGameScoring();

  const [gameState, setGameState] = useState('start');
  const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [sortedNumbers, setSortedNumbers] = useState([]);
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [levelResults, setLevelResults] = useState([]);
  
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showPermanentHint, setShowPermanentHint] = useState(false);

  const { levels: backendLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.ORDENAMIENTO, true);
  const levelRanges = useMemo(() => transformToOrdenamientoFormat(backendLevels), [backendLevels]);

  const totalActivities = useMemo(() => {
    return getTotalActivitiesForLevel(backendLevels, currentLevel, 5);
  }, [backendLevels, currentLevel]);

  const getNumbersCount = useCallback(() => {
    if (backendLevels.length > 0 && currentLevel >= 0 && currentLevel < backendLevels.length) {
      return backendLevels[currentLevel]?.config?.numbersCount || 6;
    }
    return 6;
  }, [backendLevels, currentLevel]);

  const handleBackToGames = useCallback(() => {
    navigate('/alumno/juegos', { replace: true });
  }, [navigate]);

  const handleBackToLevels = useCallback(() => setGameState('level-select'), []);
  
  const handleBackToStart = useCallback(() => {
    resetGame();
    setGameState('start');
  }, []);

  const resetGame = useCallback(() => {
    setCurrentLevel(0);
    setCurrentActivity(0);
    setOrder('asc');
    resetScoring();
    setNumbers([]);
    setSortedNumbers([]);
    setShowGameComplete(false);
    setShowLevelUp(false);
    setShowFeedback(false);
    setFeedbackSuccess(false);
    setTargetNumbers([]);
    setLevelResults([]);
    setShowPermanentHint(false);
  }, [resetScoring]);

  const setupLevel = useCallback((level) => {
    const numbersData = getNumbersForActivity(level + 1, levelRanges);
    setNumbers(numbersData.shuffled);
    setSortedNumbers(numbersData.original);
  }, [levelRanges]);

  const handleSelectOrder = useCallback((selectedOrder) => {
    setOrder(selectedOrder);
    setGameState('level-select');
  }, []);

  const handleStartGame = useCallback((level) => {
    const selectedLevelIndex = level - 1;
    setCurrentLevel(selectedLevelIndex);
    
    const lastActivity = getLastActivity(PROGRESS_KEYS.ORDENAMIENTO);
    
    let startingActivity = 0;
    if (lastActivity && lastActivity.level === level) {
      const lastActivityIndex = lastActivity.activity - 1;
      
      const levelActivities = backendLevels[selectedLevelIndex]?.activitiesCount || 5;
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
    setLevelResults([]);
    setShowPermanentHint(false);
    setGameState('game');
  }, [resetScoring, getLastActivity, backendLevels]);

  const handleActivityComplete = useCallback(() => {
    const activityScore = completeActivity(currentLevel, GAME_IDS.ORDENAMIENTO, currentActivity, currentLevel);
    const newActivity = currentActivity + 1;
    
    const result = {
      activity: currentActivity + 1,
      score: activityScore,
      attempts: attempts,
      level: currentLevel + 1
    };
    
    setLevelResults(prev => [...prev, result]);
    setTargetNumbers([]);
    setFeedbackSuccess(true);
    setShowFeedback(true);
  }, [currentLevel, currentActivity, completeActivity, attempts]);

  const handleFailedAttempt = useCallback(() => {
    incrementAttempts();
    setFeedbackSuccess(false);
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      setTargetNumbers([]); 
    }, 2500);
  }, [incrementAttempts]);

  const handleContinueAfterSuccess = useCallback(() => {
    setShowFeedback(false);
    const levelActivities = backendLevels[currentLevel]?.activitiesCount || 5;
    if (currentActivity + 1 < levelActivities) {
      setCurrentActivity(currentActivity + 1);
      setupLevel(currentLevel); 
      setTargetNumbers([]);
      setShowPermanentHint(true);
      startActivityTimer();
    } else {  
      unlockLevel(PROGRESS_KEYS.ORDENAMIENTO, currentLevel + 2);
      setShowLevelUp(true);
    }
  }, [currentActivity, currentLevel, setupLevel, unlockLevel, backendLevels, startActivityTimer]);

  const handleDrop = useCallback((draggedNumber) => {
    const newTargetNumbers = [...targetNumbers, draggedNumber];
    setTargetNumbers(newTargetNumbers);

    const numbersCount = getNumbersCount(); // Always returns 6
    if (newTargetNumbers.length === numbersCount) {
      if (checkOrder(newTargetNumbers, sortedNumbers, order)) {
        handleActivityComplete();
      } else {
        handleFailedAttempt();
      }
    }
  }, [targetNumbers, sortedNumbers, order, handleActivityComplete, handleFailedAttempt]);

  const handleRemove = useCallback((numberToRemove) => {
    setTargetNumbers(prev => prev.filter(num => num !== numberToRemove));
  }, []);

  const handleNextLevel = useCallback(() => {
    setShowLevelUp(false);
    if (currentLevel >= levelRanges.length - 1) {
      setGameState('level-select');
    } else {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setCurrentActivity(0);
      setLevelResults([]);
      setShowPermanentHint(false);
      resetScoring();
      setGameState('game');
      setTimeout(() => setupLevel(nextLevel), 100);
    }
  }, [currentLevel, setupLevel, levelRanges.length, resetScoring]);

  const getHint = useCallback(() => {
    return generateHint(numbers, order);
  }, [numbers, order]);

  useEffect(() => {
    if (gameState === 'game' && !showLevelUp) {
      setupLevel(currentLevel);
      setTargetNumbers([]);
      setShowPermanentHint(true);
      startActivityTimer();
    }
  }, [gameState, currentLevel, setupLevel, startActivityTimer, showLevelUp]);

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
        <StartScreen 
          onStart={handleSelectOrder} 
          onBackToGames={handleBackToGames}
          totalLevels={backendLevels.length}
        />
      )}
      
      {gameState === 'level-select' && (
        <LevelSelectScreen 
          order={order}
          onSelectLevel={handleStartGame} 
          onBackToStart={handleBackToStart}
          backendLevels={backendLevels}
        />
      )}
      
      {gameState === 'game' && !showGameComplete && (
        <GameScreen
          currentLevel={currentLevel}
          currentActivity={currentActivity}
          totalActivities={totalActivities}
          completedActivities={levelResults.length}
          attempts={attempts}
          points={points}
          numbers={numbers}
          sortedNumbers={sortedNumbers}
          targetNumbers={targetNumbers}
          numbersCount={getNumbersCount()}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onBackToLevels={handleBackToLevels}
          onBackToGames={handleBackToGames}
          generateHint={getHint}
          showPermanentHint={showPermanentHint}
          levelRanges={levelRanges}
          order={order}
          totalLevels={backendLevels.length}
        />
      )}

      {gameState === 'game' && showGameComplete && (
        <GameCompleteScreen
          points={points}
          currentLevel={currentLevel}
          totalActivities={totalActivities}
          onBackToGames={handleBackToGames}
          onBackToLevels={handleBackToLevels}
          onPlayAgain={handleBackToStart}
        />
      )}

      {showFeedback && !showLevelUp && (
        <FeedbackModal
          isSuccess={feedbackSuccess}
          onContinue={feedbackSuccess ? handleContinueAfterSuccess : () => setShowFeedback(false)}
          onRetry={() => {
            setShowFeedback(false);
            setTargetNumbers([]);
          }}
        />
      )}

      {showLevelUp && (
        <CongratsModal
          level={currentLevel + 1}
          points={points}
          onNextLevel={handleNextLevel}
          onBackToLevels={() => {
            setShowLevelUp(false);
            setGameState('level-select');
          }}
          totalLevels={backendLevels.length}
        />
      )}
    </div>
  );
};

export default JuegoOrdenamiento;