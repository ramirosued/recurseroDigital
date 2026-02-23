
export const getNumbersForActivity = (levelConfigOrIndex, levelRanges = null) => {
  let levelConfig;

  if (typeof levelConfigOrIndex === 'number') {
    const levelIndex = levelConfigOrIndex - 1;
    levelConfig = levelRanges && levelRanges[levelIndex] ? levelRanges[levelIndex] : null;
  } else if (typeof levelConfigOrIndex === 'object' && levelConfigOrIndex !== null) {
    levelConfig = levelConfigOrIndex;
  }

  if (!levelConfig || (!levelConfig.min && levelConfig.min !== 0) || !levelConfig.max) {
    console.warn('No se encontró configuración del nivel válida, usando valores por defecto:', {
      levelConfigOrIndex,
      levelConfig,
      levelRanges
    });
    const defaultConfigs = [
      { min: 0, max: 99, numbersCount: 6 },
      { min: 100, max: 999, numbersCount: 6 },
      { min: 1000, max: 9999, numbersCount: 6 }
    ];
    const levelIndex = typeof levelConfigOrIndex === 'number' ? levelConfigOrIndex - 1 : 0;
    levelConfig = defaultConfigs[levelIndex] || defaultConfigs[0];
  }

  const { min, max, numbersCount = 6 } = levelConfig;
  const generatedNumbers = new Set();

  while (generatedNumbers.size < numbersCount) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    generatedNumbers.add(randomNumber);
  }

  const numbers = Array.from(generatedNumbers);
  const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
  
  return {
    shuffled: shuffledNumbers,
    original: numbers,
    sorted: [...numbers].sort((a, b) => a - b)
  };
};

export const getOrderConfig = (order) => {
  const configs = {
    asc: {
      icon: '📈',
      name: 'Menor a Mayor',
      description: 'Ordena los números de menor a mayor'
    },
    desc: {
      icon: '📉',
      name: 'Mayor a Menor',
      description: 'Ordena los números de mayor a menor'
    }
  };
  return configs[order] || configs.asc;
};

export const getOrderInstruction = (order = 'asc') => {
  if (order === 'desc') {
    return {
      icon: '📉',
      text: 'ORDENA DE',
      highlight1: 'MAYOR',
      middle: 'A',
      highlight2: 'MENOR',
      endIcon: '📉'
    };
  }
  return {
    icon: '📈',
    text: 'ORDENA DE',
    highlight1: 'MENOR',
    middle: 'A',
    highlight2: 'MAYOR',
    endIcon: '📈'
  };
};

export const generateHint = (numbers, order = 'asc') => {
  const sortedNumbers = order === 'desc' 
    ? [...numbers].sort((a, b) => b - a)
    : [...numbers].sort((a, b) => a - b);
  const first = sortedNumbers[0];
  const last = sortedNumbers[sortedNumbers.length - 1];
  
  const hints = order === 'desc' ? [
    `🔢 El número más grande es: ${first.toLocaleString()}`,
    `🔢 El número más pequeño es: ${last.toLocaleString()}`,
    `➡️ Comienza colocando el número ${first.toLocaleString()} primero`,
    `🎯 El orden correcto empieza: ${sortedNumbers.slice(0, 3).map(n => n.toLocaleString()).join(', ')}...`
  ] : [
    `🔢 El número más pequeño es: ${first.toLocaleString()}`,
    `🔢 El número más grande es: ${last.toLocaleString()}`,
    `➡️ Comienza colocando el número ${first.toLocaleString()} primero`,
    `🎯 El orden correcto empieza: ${sortedNumbers.slice(0, 3).map(n => n.toLocaleString()).join(', ')}...`
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
};

export const checkOrder = (currentNumbers, originalNumbers, order = 'asc') => {
  const correctOrder = order === 'desc'
    ? [...originalNumbers].sort((a, b) => b - a)
    : [...originalNumbers].sort((a, b) => a - b);
  return JSON.stringify(currentNumbers) === JSON.stringify(correctOrder);
};


export const getLevelConfig = (level) => {
  const configs = {
    1: { 
      name: "Nivel 1", 
      description: "Números del 0 al 99",
      range: "0 - 99"
    },
    2: { 
      name: "Nivel 2", 
      description: "Números del 100 al 999",
      range: "100 - 999"
    },
    3: { 
      name: "Nivel 3", 
      description: "Números del 1.000 al 9.999",
      range: "1.000 - 9.999"
    }
  };
  return configs[level] || configs[1];
};

export const formatNumber = (num) => {
  return num.toLocaleString('es-AR');
};


export const getNumbersCount = () => 6;

export const generateNumbers = (level, levelRanges) => {
  const levelConfig = levelRanges[level] || levelRanges[0];
  
  if (!levelConfig) {
    console.warn('No se encontró configuración para el nivel', level);
    return getNumbersForActivity({ min: 0, max: 99, numbersCount: 6 });
  }

  return getNumbersForActivity(levelConfig);
};


export const levelRanges = [
    { min: 0, max: 99, name: "Números del 0 al 99", description: "0 - 99", numbersCount: 6 },
    { min: 100, max: 999, name: "Números del 100 al 999", description: "100 - 999", numbersCount: 6 },
    { min: 1000, max: 9999, name: "Números del 1.000 al 9.999", description: "1.000 - 9.999", numbersCount: 6 },
];

export const totalActivities = 5;