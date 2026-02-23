// ===== CONSTANTES DE CONFIGURACIÓN =====
export const GAME_CONFIG = {
    TOTAL_QUESTIONS: 5,
    BASE_SCORE: 50,
    MAX_LEVELS: 3,
    PENALTY_PER_ATTEMPT: 5,
    MAX_ATTEMPTS_FOR_HINT: 3
};

export const VALIDATION = {
    NUMBER_REGEX: /^-?\d+$/,
    EMPTY_OR_NUMBER_REGEX: /^$|^-?\d+$/
};

export const UI_STATES = {
    INPUT_STATES: {
        NEUTRAL: 'neutral',
        TYPING: 'typing', 
        CORRECT: 'correct',
        INCORRECT: 'incorrect',
        ERROR: 'error'
    },
    GAME_STATES: {
        START: 'start',
        LEVEL_SELECT: 'levelSelect', 
        PLAYING: 'playing'
    }
};

export const MESSAGES = {
    SUCCESS: [
        '¡Excelente trabajo!',
        '¡Muy bien hecho!',
        '¡Correcto, sigue así!',
        '¡Fantástico!',
        '¡Perfecto!',
        '¡Genial!'
    ],
    VALIDATION_ERRORS: {
        INCOMPLETE_FIELDS: 'Por favor, completa tanto el número anterior como el posterior antes de verificar.',
        INVALID_NUMBER: 'Por favor, ingresa un número válido.',
        REQUIRED_FIELD: 'Este campo es obligatorio.'
    },
    PROGRESSIVE_HINTS: {
        ATTEMPT_2: 'Recuerda: anterior significa restar, posterior significa sumar',
        ATTEMPT_3: (baseNumber, operation) => `Para ${baseNumber}, el anterior es ${baseNumber - operation} y el posterior es ${baseNumber + operation}`,
        DEFAULT: (operation) => `El anterior es ${operation} menos, el posterior es ${operation} más`
    }
};


export const calculateActivityScore = (level, attempts = 0) => {
    // Nivel 0 (Juego 1) = 50 * 1 = 50
    // Nivel 1 (Juego 2) = 50 * 2 = 100
    // Nivel 2 (Juego 3) = 50 * 3 = 150
    const baseScore = GAME_CONFIG.BASE_SCORE * (level + 1);

    const failedAttempts = Math.max(0, attempts - 1);
    const penalty = failedAttempts * GAME_CONFIG.PENALTY_PER_ATTEMPT;
    
    return Math.max(0, baseScore - penalty);
};

export const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
};

export const isValidNumber = (value) => {
    if (value === '') return true; 
    return VALIDATION.NUMBER_REGEX.test(value);
};

export const isAnswerCorrect = (answer, expected) => {
    const parsed = parseInt(answer?.toString().trim());
    return !isNaN(parsed) && parsed === expected;
};

export const calculatePercentage = (points, totalQuestions, level) => {
    const maxPossiblePoints = totalQuestions * GAME_CONFIG.BASE_SCORE * (level + 1);
    return Math.round((points / maxPossiblePoints) * 100);
};

export const getProgressiveHint = (attempts, question) => {
    if (attempts === 2) {
        return MESSAGES.PROGRESSIVE_HINTS.ATTEMPT_2;
    }
    if (attempts >= 3) {
        return MESSAGES.PROGRESSIVE_HINTS.ATTEMPT_3(question.baseNumber, question.operation);
    }
    return MESSAGES.PROGRESSIVE_HINTS.DEFAULT(question.operation);
};

export const generateRandomNumber = (levelConfig) => {
    return Math.floor(Math.random() * (levelConfig.max - levelConfig.min + 1)) + levelConfig.min;
};

export const createAnteriorPosteriorQuestion = (levelConfig) => {
    const baseNumber = generateRandomNumber(levelConfig);
    return {
        type: 'anteriorPosterior',
        baseNumber,
        correctAnterior: baseNumber - levelConfig.operation,
        correctPosterior: baseNumber + levelConfig.operation,
        operation: levelConfig.operation,
        hint: MESSAGES.PROGRESSIVE_HINTS.DEFAULT(levelConfig.operation)
    };
};

export const isLevelPassed = () => {
    return true; 
};