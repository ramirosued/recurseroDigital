import { useState, useCallback } from 'react';
import useGameScoringAPI from './useGameScoring.api';


const useGameScoring = () => {
  const [points, setPoints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [activityStartTime, setActivityStartTime] = useState(null); // Tiempo de inicio de la actividad actual
  const { submitGameScore, isSubmitting, submitError } = useGameScoringAPI();


  const calculateActivityScore = useCallback((level, currentAttempts = null) => {
    const baseScore = 50 * (level + 1);
    const attemptsToUse = currentAttempts !== null ? currentAttempts : attempts;
    const penaltyForAttempts = attemptsToUse * 5;
    return Math.max(0, baseScore - penaltyForAttempts);
  }, [attempts]);

  const addPoints = useCallback((scoreToAdd) => {
    setPoints(prev => prev + scoreToAdd);
  }, []);


  const incrementAttempts = useCallback(() => {
    setAttempts(prev => prev + 1);
  }, []);


  const resetAttempts = useCallback(() => {
    setAttempts(0);
  }, []);


  const resetScoring = useCallback(() => {
    setPoints(0);
    setAttempts(0);
    setActivityStartTime(null);
  }, []);


  const startActivityTimer = useCallback(() => {
    setActivityStartTime(new Date().toISOString());
  }, []);


  const completeActivity = useCallback(async (level, gameType = null, activity = null, maxUnlockedLevel = null, additionalData = {}) => {
    const activityScore = calculateActivityScore(level);
    addPoints(activityScore);
    
    if (gameType) {
      try {
        const endTime = new Date().toISOString();
        
        await submitGameScore({
          gameType,
          level,
          activity,
          points: points + activityScore,
          activityScore,
          attempts: additionalData.attempts !== undefined ? additionalData.attempts : attempts,
          maxUnlockedLevel,
          startTime: activityStartTime,
          endTime: endTime,
          ...additionalData
        });
      } catch (error) {
        console.warn('Error al guardar puntaje en BD, continuando con el juego:', error);
      }
    }
    
    setActivityStartTime(null);
    resetAttempts();
    return activityScore;
  }, [calculateActivityScore, addPoints, resetAttempts, submitGameScore, points, attempts, activityStartTime]);


  const getScoringInfo = useCallback((level) => {
    return {
      totalPoints: points,
      currentAttempts: attempts,
      potentialScore: calculateActivityScore(level),
      baseScore: 50 * (level + 1),
      penalty: attempts * 5
    };
  }, [points, attempts, calculateActivityScore]);

  return {
    // Estado
    points,
    attempts,
    
    calculateActivityScore,
    getScoringInfo,
    addPoints,
    incrementAttempts,
    resetAttempts,
    resetScoring,
    completeActivity,
    startActivityTimer,
    isSubmitting,
    submitError,
    submitGameScore
  };
};

export default useGameScoring;