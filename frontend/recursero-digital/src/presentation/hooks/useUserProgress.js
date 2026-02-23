import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../infrastructure/config/api';
import { GAME_IDS, PROGRESS_KEYS } from '../../constants/games';

const PROGRESS_KEY = 'userGameProgress';

const DEFAULT_PROGRESS = {
  [PROGRESS_KEYS.ORDENAMIENTO]: 1,
  [PROGRESS_KEYS.ESCRITURA]: 1,
  [PROGRESS_KEYS.DESCOMPOSICION]: 1,
  [PROGRESS_KEYS.ESCALA]: 1,
  [PROGRESS_KEYS.CALCULOS_SUMA]: 1,
  [PROGRESS_KEYS.CALCULOS_RESTA]: 1,
  [PROGRESS_KEYS.CALCULOS_MULTIPLICACION]: 1
};

const loadLocalProgress = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (!saved) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(saved);
    const merged = {
      ...DEFAULT_PROGRESS,
      ...parsed
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.warn('No se pudo cargar progreso local, se usa default:', error);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
    return DEFAULT_PROGRESS;
  }
};

const getStudentIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id || payload?.userId || null;
  } catch (error) {
    console.warn('No se pudo obtener el studentId desde el token:', error);
    return null;
  }
};

const mapGameIdToProgressKey = (gameId) => {
  if (!gameId) {
    return null;
  }

  if (gameId.startsWith(GAME_IDS.CALCULOS)) {
    return `calculos-${gameId.split('-')[2] || 'suma'}`;
  }

  const map = {
    [GAME_IDS.ORDENAMIENTO]: PROGRESS_KEYS.ORDENAMIENTO,
    [GAME_IDS.ESCRITURA]: PROGRESS_KEYS.ESCRITURA,
    [GAME_IDS.DESCOMPOSICION]: PROGRESS_KEYS.DESCOMPOSICION,
    [GAME_IDS.ESCALA]: PROGRESS_KEYS.ESCALA
  };

  return map[gameId] || null;
};

const mergeProgress = (baseProgress, backendProgress) => {
  if (!Array.isArray(backendProgress)) {
    return baseProgress;
  }

  
  if (backendProgress.length === 0) {
    return { ...DEFAULT_PROGRESS };
  }

  const merged = { ...DEFAULT_PROGRESS };

  backendProgress.forEach((progressItem) => {
    if (progressItem.gameId === 'game-calculos') {
      const statistics = progressItem.statistics || [];
      
      const operationProgress = {
        'calculos-suma': 1,
        'calculos-resta': 1,
        'calculos-multiplicacion': 1
      };
      
      const mapBackendLevelToOperation = (backendLevel) => {
        if (backendLevel >= 1 && backendLevel <= 3) {
          return { operation: 'calculos-suma', localLevel: backendLevel };
        } else if (backendLevel >= 4 && backendLevel <= 6) {
          return { operation: 'calculos-resta', localLevel: backendLevel - 3 };
        } else if (backendLevel >= 7 && backendLevel <= 9) {
          return { operation: 'calculos-multiplicacion', localLevel: backendLevel - 6 };
        }
        return null;
      };
      
      statistics.forEach((stat) => {
        if (!stat.isCompleted) {
          return;
        }
        
        const backendLevel = stat.level;
        const levelInfo = mapBackendLevelToOperation(backendLevel);
        
        if (levelInfo) {
          const { operation, localLevel } = levelInfo;
          
          if (localLevel > operationProgress[operation]) {
            operationProgress[operation] = localLevel;
          }
          
          if (stat.maxUnlockedLevel) {
            const nextLevelInfo = mapBackendLevelToOperation(stat.maxUnlockedLevel);
            
            if (nextLevelInfo && nextLevelInfo.operation === operation) {
              if (nextLevelInfo.localLevel > operationProgress[operation]) {
                operationProgress[operation] = nextLevelInfo.localLevel;
              }
            }
          }
        }
      });
      
      merged['calculos-suma'] = operationProgress['calculos-suma'];
      merged['calculos-resta'] = operationProgress['calculos-resta'];
      merged['calculos-multiplicacion'] = operationProgress['calculos-multiplicacion'];
      
      return;
    }
    
    const progressKey = mapGameIdToProgressKey(progressItem.gameId);
    if (!progressKey) {
      return;
    }

    const backendMax = progressItem.maxUnlockedLevel || 1;
    
    merged[progressKey] = backendMax;
  });

  return merged;
};

export const useUserProgress = () => {
  const studentId = getStudentIdFromToken();
  const [unlockedLevels, setUnlockedLevels] = useState(() => loadLocalProgress());
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressError, setProgressError] = useState(null);
  const [lastActivities, setLastActivities] = useState({});

  const syncWithBackend = useCallback(async () => {
    if (!studentId) {
      return;
    }

    try {
      setLoadingProgress(true);
      setProgressError(null);

      const response = await apiRequest(`/statistics/student/${studentId}`);

      if (response.ok && response.data && Array.isArray(response.data.gameProgress)) {
        const merged = mergeProgress(DEFAULT_PROGRESS, response.data.gameProgress);
        setUnlockedLevels(merged);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
        
        const activities = {};
        response.data.gameProgress.forEach((progressItem) => {
          const progressKey = mapGameIdToProgressKey(progressItem.gameId);
          if (progressKey && Array.isArray(progressItem.statistics) && progressItem.statistics.length > 0) {
            const completedStats = progressItem.statistics.filter(stat => stat.isCompleted);
            if (completedStats.length > 0) {
              const sortedStats = completedStats.sort((a, b) => {
                if (a.level !== b.level) return b.level - a.level;
                return b.activity - a.activity;
              });
              
              const lastStat = sortedStats[0];
              
              activities[progressKey] = {
                level: lastStat.level,
                activity: lastStat.activity
              };
            }
          }
        });
        setLastActivities(activities);
      } else {
        throw new Error('Respuesta inválida del backend.');
      }
    } catch (error) {
      console.warn('No se pudo sincronizar progreso desde el backend:', error);
      setProgressError('No se pudo obtener el progreso más reciente. Se utiliza el progreso guardado en el dispositivo.');
      // Si hay error, usar valores por defecto
      setUnlockedLevels({ ...DEFAULT_PROGRESS });
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
    } finally {
      setLoadingProgress(false);
    }
  }, [studentId]);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const unlockLevel = useCallback((game, level) => {
    setUnlockedLevels((prev) => {
      const newProgress = {
        ...prev,
        [game]: Math.max(prev[game] || 1, level)
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const isLevelUnlocked = useCallback((game, level) => {
    return level <= (unlockedLevels[game] || 1);
  }, [unlockedLevels]);

  const getMaxUnlockedLevel = useCallback((game) => {
    return unlockedLevels[game] || 1;
  }, [unlockedLevels]);

  const getLastActivity = useCallback((game) => {
    return lastActivities[game] || null;
  }, [lastActivities]);

  const resetProgress = useCallback(() => {
    setUnlockedLevels(DEFAULT_PROGRESS);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
    setLastActivities({});
  }, []);

  return {
    unlockedLevels,
    unlockLevel,
    isLevelUnlocked,
    getMaxUnlockedLevel,
    getLastActivity,
    resetProgress,
    syncWithBackend,
    loadingProgress,
    progressError
  };
};
