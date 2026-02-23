import { useState } from 'react';
import { apiRequest } from '../../infrastructure/config/api';


const useGameScoringAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);


  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || '';
    } catch (error) {
      console.error('Error al extraer userId del token:', error);
      return '';
    }
  };

  const getGameId = (gameType) => {
    const gameIdMap = {
      'ordenamiento': 'game-ordenamiento',
      'escritura': 'game-escritura',
      'descomposicion': 'game-descomposicion',
      'escala': 'game-escala',
      'calculos': 'game-calculos'
    };
    return gameIdMap[gameType] || gameType;
  };

  const prepareGameScoreData = ({
    gameType,
    level,
    activity,
    activityScore,
    attempts,
    maxUnlockedLevel,
    completed = true,
    startTime = null,
    endTime = null,
    correctAnswers = undefined,
    totalQuestions = undefined
  }) => {
    const userId = getUserIdFromToken();
    
    const gameId = getGameId(gameType);
    
    let completionTime = null;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      completionTime = Math.round((end - start) / 1000); // en segundos
    }
    

    const isCalculosGame = gameId === 'game-calculos';
    const calculatedMaxUnlockedLevel = maxUnlockedLevel !== null && maxUnlockedLevel !== undefined 
      ? (isCalculosGame ? maxUnlockedLevel : maxUnlockedLevel + 1)
      : (level + 2);
    
    const preparedData = {
      studentId: userId,
      gameId: gameId,
      level: level + 1,
      activity: activity !== null && activity !== undefined ? activity + 1 : 1,
      points: activityScore || 0,
      attempts,
      completionTime: completionTime,
      isCompleted: completed,
      maxUnlockedLevel: calculatedMaxUnlockedLevel
    };

    if (correctAnswers !== undefined) {
      preparedData.correctAnswers = correctAnswers;
    }
    if (totalQuestions !== undefined) {
      preparedData.totalQuestions = totalQuestions;
    }

    return preparedData;
  };


  const submitGameScore = async (scoreData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const preparedData = prepareGameScoreData(scoreData);
      
      console.log('📤 Enviando estadísticas al backend:', preparedData);
      
      const response = await apiRequest('/statistics', {
        method: 'POST',
        body: JSON.stringify(preparedData)
      });

      if (!response.ok) {
        throw new Error(`Error al guardar el puntaje: ${response.data?.error || 'Error desconocido'}`);
      }

      console.log('✅ Puntaje guardado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al guardar puntaje:', error);
      setSubmitError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitUserProgress = async (game, unlockedLevel) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const progressData = {
        userEmail: localStorage.getItem('userEmail'),
        gameType: game,
        maxUnlockedLevel: unlockedLevel,
        timestamp: new Date().toISOString()
      };

      const response = await apiRequest('/user-progress', {
        method: 'POST',
        body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar el progreso');
      }

      console.log('✅ Progreso guardado exitosamente:', progressData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
      setSubmitError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitGameScore,
    submitUserProgress,
    prepareGameScoreData,
    isSubmitting,
    submitError,
    getUserIdFromToken,
    getGameId
  };
};

export default useGameScoringAPI;