export const decomposeNumber = (num) => {
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
};

export const generateRandomNumber = (level) => {
    const ranges = [
        { min: 10, max: 99 },      
        { min: 100, max: 999 },    
        { min: 1000, max: 9999 }   
    ];
    
    const range = ranges[level];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const validateDecomposition = (userAnswer, correctAnswer) => {
    const userParts = userAnswer.split('+').map(part => parseInt(part.trim())).filter(n => !isNaN(n));
    return JSON.stringify(userParts.sort((a, b) => a - b)) === 
           JSON.stringify(correctAnswer.sort((a, b) => a - b));
};

export const validateComposition = (userAnswer, correctAnswer) => {
    return parseInt(userAnswer) === correctAnswer;
};

export const generateQuestion = (level) => {
    const gameType = Math.random() > 0.5 ? 'decomposition' : 'composition';
    const number = generateRandomNumber(level);
    const decomposition = decomposeNumber(number);
    
    if (gameType === 'decomposition') {
        return {
            type: 'decomposition',
            number: number,
            correctAnswer: decomposition,
            hint: "Cada cifra ocupa un lugar: unidades, decenas, centenas, miles"
        };
    } else {
        return {
            type: 'composition',
            decomposition: decomposition,
            correctAnswer: number,
            hint: "Suma todos los números para obtener el resultado final"
        };
    }
};

export const calculateScore = (level, attempts) => {
    const baseScore = 50 * (level + 1);
    const penalty = attempts * 5;
    return Math.max(0, baseScore - penalty);
};

export const getFeedbackMessage = (percentage) => {
    if (percentage === 100) {
        return {
            message: "¡Perfecto! Eres un genio de los números 🌟",
            colorClass: "from-yellow-400 to-orange-500"
        };
    } else if (percentage >= 80) {
        return {
            message: "¡Excelente trabajo! 🎊",
            colorClass: "from-green-400 to-blue-500"
        };
    } else if (percentage >= 60) {
        return {
            message: "¡Buen trabajo! Sigue practicando 💪",
            colorClass: "from-purple-400 to-pink-500"
        };
    } else {
        return {
            message: "¡Sigue practicando! Lo harás mejor la próxima vez 📚",
            colorClass: "from-blue-400 to-purple-500"
        };
    }
};