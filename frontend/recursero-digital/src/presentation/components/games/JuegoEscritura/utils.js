const basicNumbers = {
    0: "cero", 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
    11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
    16: "dieciseis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
    20: "veinte", 21: "veintiuno", 22: "veintidos", 23: "veintitres",
    24: "veinticuatro", 25: "veinticinco", 26: "veintiseis", 27: "veintisiete",
    28: "veintiocho", 29: "veintinueve", 30: "treinta", 40: "cuarenta",
    50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa",
    100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos",
    500: "quinientos", 600: "seiscientos", 700: "setecientos", 800: "ochocientos",
    900: "novecientos", 1000: "mil"
};

export const levelRanges = [
    { min: 1, max: 50 },
    { min: 51, max: 200 },
    { min: 201, max: 500 }
];

export function numberToWords(num) {
    if (num === 0) return "cero";
    if (num < 0) return "menos " + numberToWords(-num);
    
    if (basicNumbers[num]) {
        return basicNumbers[num];
    }
    
    if (num >= 31 && num <= 99) {
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        if (ones === 0) {
            return basicNumbers[tens];
        }
        if (ones === 1) {
            return basicNumbers[tens] + " y uno";
        }
        return basicNumbers[tens] + " y " + basicNumbers[ones];
    }
    
    if (num >= 101 && num <= 999) {
        const hundreds = Math.floor(num / 100) * 100;
        const remainder = num % 100;
        
        let hundredsWord;
        if (hundreds === 100) {
            hundredsWord = "ciento";
        } else {
            hundredsWord = basicNumbers[hundreds];
        }
        
        if (remainder === 0) {
            return hundredsWord;
        }
        
        return hundredsWord + " " + numberToWords(remainder);
    }
    
    if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        
        let thousandsWord;
        if (thousands === 1) {
            thousandsWord = "mil";
        } else {
            thousandsWord = numberToWords(thousands) + " mil";
        }
        
        if (remainder === 0) {
            return thousandsWord;
        }
        
        if (remainder < 100) {
            return thousandsWord + " " + numberToWords(remainder);
        }
        
        return thousandsWord + " " + numberToWords(remainder);
    }
    
    return num.toString();
}

export function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u');
}

export function validateAnswer(userAnswer, correctAnswer) {
    const normalizedUserAnswer = normalizeText(userAnswer);
    const normalizedCorrectAnswer = normalizeText(correctAnswer);
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


export function generateDragDropActivity(level, levelConfig = null, activitiesCount = 5) {
    const range = levelConfig || levelRanges[level];
    if (!range || !range.min || !range.max) {
        console.warn('No se encontró configuración válida para el nivel', level);
        return { numbers: [], wordPairs: [] };
    }
    
    const baseNumbers = [];
    const usedNumbers = new Set();
    const maxAttempts = 100;
    const numberOfOptions = 5; // Siempre 5 opciones independientemente de activitiesCount
    
    let attempts = 0;
    while (baseNumbers.length < numberOfOptions && attempts < maxAttempts) {
        const randomNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        attempts++;

        if (!usedNumbers.has(randomNumber)) {
            const word = numberToWords(randomNumber);
            if (word && word !== randomNumber.toString()) {
                baseNumbers.push(randomNumber);
                usedNumbers.add(randomNumber);
            }
        }
    }

    const distractorNumbers = [];
    attempts = 0;
    while (distractorNumbers.length < 3 && attempts < maxAttempts) {
        const randomNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        attempts++;

        if (!usedNumbers.has(randomNumber)) {
            distractorNumbers.push(randomNumber);
            usedNumbers.add(randomNumber);
        }
    }
    
    const wordPairs = baseNumbers.map(number => ({
        number: number,
        word: numberToWords(number)
    }));
    
    const shuffledWordPairs = shuffleArray(wordPairs);
    const allNumbers = [...baseNumbers, ...distractorNumbers];
    const shuffledNumbers = shuffleArray(allNumbers);
    
    return { numbers: shuffledNumbers, wordPairs: shuffledWordPairs };
}


export function validateNumberWordPair(number, word) {
    const correctWord = numberToWords(number);
    return normalizeText(word) === normalizeText(correctWord);
}


export function generateHintExample(level, usedNumbers, levelConfig = null) {
    const range = levelConfig || levelRanges[level];
    
    if (!range || !range.min || !range.max) {
        return { 
            number: 25, 
            word: "veinticinco"
        };
    }
    
    const usedNumbersArray = Array.isArray(usedNumbers) ? usedNumbers : Array.from(usedNumbers);
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
        const randomNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const word = numberToWords(randomNumber);
        
        if (!usedNumbersArray.includes(randomNumber) && word && word !== randomNumber.toString()) {
            return {
                number: randomNumber,
                word: word
            };
        }
        attempts++;
    }
    
    return { 
        number: Math.max(range.min, 25), 
        word: numberToWords(Math.max(range.min, 25))
    };
}