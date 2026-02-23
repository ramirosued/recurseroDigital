import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles/globals/games.css";
import "./JuegoCalculos.css";

import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import CongratsModal from './CongratsModal';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels } from '../../../../hooks/useGameLevels';
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';

const JuegoCalculos = () => {
  const navigate = useNavigate();
  const { unlockLevel } = useUserProgress();
  const { 
    incrementAttempts, 
    resetScoring, 
    completeActivity,
    addPoints,
    startActivityTimer
  } = useGameScoring();

  // Game state management
  const [gameState, setGameState] = useState('start'); // 'start', 'levelSelect', 'playing', 'gameComplete'
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [gameResults, setGameResults] = useState({
    isWin: false,
    finalScore: 0,
    lives: 0,
    correctAnswers: 0,
    totalQuestions: 0
  });

  const { levels: allLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.CALCULOS, true);

  const handleBackToGames = useCallback(() => {
    navigate('/alumno/juegos', { replace: true });
  }, [navigate]);

  const handleStartGame = useCallback((operation) => {
    setSelectedOperation(operation);
    setGameState('levelSelect');
  }, []);

  const handleSelectLevel = useCallback((level) => {
    setSelectedLevel(level);
    setGameState('playing');
    resetScoring();
    startActivityTimer();
  }, [resetScoring, startActivityTimer]);

  const handleActivityComplete = useCallback((activityIndex, attempts, correctAnswers, totalQuestions, isLastActivity = false) => {
    const levelNumber = parseInt(selectedLevel.replace('nivel', ''));

    const operationOffset = {
      suma: 0,
      resta: 3,
      multiplicacion: 6
    };

    const backendLevel = levelNumber + operationOffset[selectedOperation];
    const backendLevelIndex = backendLevel - 1;
    
    let maxUnlockedLevel = backendLevel;
    if (isLastActivity && levelNumber < 3) {
      const nextLevelNumber = levelNumber + 1;
      maxUnlockedLevel = nextLevelNumber + operationOffset[selectedOperation];
    }
    
    completeActivity(
      backendLevelIndex,  
      GAME_IDS.CALCULOS,                
      activityIndex,                 
      maxUnlockedLevel,
      {
        correctAnswers,
        totalQuestions,
        attempts: attempts
      }
    );

  }, [selectedLevel, selectedOperation, completeActivity]);

  const handleBackToStart = useCallback(() => {
    setSelectedOperation(null);
    setSelectedLevel(null);
    setGameState('start');
  }, []);

  const handleBackToLevelSelect = useCallback(() => {
    setSelectedLevel(null);
    setGameState('levelSelect');
  }, []);

  const handleGameComplete = useCallback((isWin, finalScore, correctAnswers, totalQuestions, totalAttempts) => {
    setGameResults({
      isWin,
      finalScore,
      lives: 0, // No lives system
      correctAnswers,
      totalQuestions,
      totalAttempts
    });

    const levelNumber = parseInt(selectedLevel.replace('nivel', ''));
    
    if (levelNumber < 3) {
      const gameId = `calculos-${selectedOperation}`;
      unlockLevel(gameId, levelNumber + 1);
    }

    setGameState('gameComplete');
  }, [selectedLevel, selectedOperation, unlockLevel]);

  const handlePlayAgain = useCallback(() => {
    setGameState('playing');
    resetScoring();
    startActivityTimer(); 
  }, [resetScoring, startActivityTimer]);

  const handlePlayNextLevel = useCallback((nextLevel) => {
    setSelectedLevel(nextLevel);
    setGameState('playing');
    resetScoring();
    startActivityTimer();
  }, [resetScoring, startActivityTimer]);

  const handleUpdateScore = useCallback((points) => {
    addPoints(points);
  }, [addPoints]);

  const handleUpdateAttempts = useCallback(() => {
    incrementAttempts();
  }, [incrementAttempts]);

  if (levelsLoading) {
    return (
      <div className="game-wrapper bg-space-gradient">
        <div>Cargando niveles...</div>
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch(gameState) {
      case 'start':
        return (
          <StartScreen 
            onStartGame={handleStartGame}
            onBackToGames={handleBackToGames}
          />
        );

      case 'levelSelect':
        return (
          <LevelSelectScreen 
            operation={selectedOperation}
            onSelectLevel={handleSelectLevel}
            onBackToStart={handleBackToStart}
          />
        );

      case 'playing':
        return (
          <GameScreen 
            operation={selectedOperation}
            level={selectedLevel}
            allLevels={allLevels}
            onGameComplete={handleGameComplete}
            onBackToLevelSelect={handleBackToLevelSelect}
            onUpdateScore={handleUpdateScore}
            onUpdateAttempts={handleUpdateAttempts}
            onActivityComplete={handleActivityComplete}
            onStartActivityTimer={startActivityTimer}
          />
        );

      case 'gameComplete':
        return (
          <>
            {/* Keep the previous screen visible behind the modal */}
            <GameScreen 
              operation={selectedOperation}
              level={selectedLevel}
              allLevels={allLevels}
              onGameComplete={handleGameComplete}
              onBackToLevelSelect={handleBackToLevelSelect}
              onUpdateScore={handleUpdateScore}
              onUpdateAttempts={handleUpdateAttempts}
            />
            <CongratsModal 
              isVisible={true}
              isWin={gameResults.isWin}
              operation={selectedOperation}
              level={selectedLevel}
              finalScore={gameResults.finalScore}
              totalQuestions={gameResults.totalQuestions}
              correctAnswers={gameResults.correctAnswers}
              totalAttempts={gameResults.totalAttempts}
              onPlayAgain={handlePlayAgain}
              onNextLevel={handlePlayNextLevel}
              onBackToLevelSelect={handleBackToLevelSelect}
              onBackToStart={handleBackToStart}
            />
          </>
        );

      default:
        return (
          <StartScreen 
            onStartGame={handleStartGame}
            onBackToGames={handleBackToGames}
          />
        );
    }
  };

  return (
    <div className="game-wrapper bg-space-gradient">
      {renderCurrentScreen()}
    </div>
  );
};

export default JuegoCalculos;