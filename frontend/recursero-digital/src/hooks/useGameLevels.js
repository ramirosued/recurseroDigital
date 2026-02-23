import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../infrastructure/config/api';

export const useGameLevels = (gameId, onlyActive = true) => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!gameId) {
            setLoading(false);
            return;
        }

        const fetchLevels = async () => {
            try {
                setLoading(true);
                setError(null);

                const fullGameId = gameId.startsWith('game-') ? gameId : `game-${gameId}`;
                const url = `${API_BASE_URL}/games/${fullGameId}/levels${onlyActive ? '?onlyActive=true' : ''}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Error al obtener niveles: ${response.statusText}`);
                }

                const data = await response.json();
                setLevels(data.levels || []);
            } catch (err) {
                console.error('Error al cargar niveles del juego:', err);
                setError(err.message);
                setLevels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLevels();
    }, [gameId, onlyActive]);

    return { levels, loading, error };
};

export const transformToDescomposicionFormat = (levels) => {
    return levels.map(level => ({
        name: level.name,
        range: level.config.range || `${level.config.min} al ${level.config.max}`,
        min: level.config.min,
        max: level.config.max,
        color: level.config.color,
        activitiesCount: level.activitiesCount
    }));
};

export const transformToEscalaFormat = (levels) => {
    return levels.map(level => ({
        name: level.name,
        range: level.config.range || `${level.config.min} al ${level.config.max}`,
        operation: level.config.operation,
        min: level.config.min,
        max: level.config.max,
        color: level.config.color,
        description: level.description,
        activitiesCount: level.activitiesCount
    }));
};

export const transformToOrdenamientoFormat = (levels) => {
    return levels.map(level => ({
        min: level.config.min,
        max: level.config.max,
        numbersCount: level.config.numbersCount || 6,
        name: level.name,
        description: level.description,
        color: level.config.color || 'blue',
        activitiesCount: level.activitiesCount
    }));
};

export const transformToEscrituraFormat = (levels) => {
    return levels.map(level => ({
        name: level.name,
        difficulty: level.difficulty,
        min: level.config?.min || 1,
        max: level.config?.max || 50,
        range: level.config?.range || `${level.config?.min || 1} - ${level.config?.max || 50}`,
        color: level.config?.color
    }));
};

export const fetchGameLevel = async (gameId, levelNumber) => {
    try {
        const fullGameId = gameId.startsWith('game-') ? gameId : `game-${gameId}`;
        const response = await fetch(`${API_BASE_URL}/games/${fullGameId}/levels/${levelNumber}`);

        if (!response.ok) {
            throw new Error(`Error al obtener nivel: ${response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        console.error(`Error al cargar nivel ${levelNumber} del juego ${gameId}:`, err);
        throw err;
    }
};

export const useGameLevel = (gameId, levelNumber) => {
    const [level, setLevel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!gameId || !levelNumber) {
            setLoading(false);
            return;
        }

        const fetchLevel = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchGameLevel(gameId, levelNumber);
                setLevel(data);
            } catch (err) {
                setError(err.message);
                setLevel(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLevel();
    }, [gameId, levelNumber]);

    return { level, loading, error };
};

