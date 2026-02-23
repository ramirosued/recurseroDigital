/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games
    SET 
      name = 'Ordenamiento de Números',
      description = '¡Aprende a ordenar números de forma divertida! Juega y mejora tus habilidades matemáticas de menor a mayor.',
      route = '/alumno/juegos/ordenamiento'
    WHERE id = 'game-ordenamiento';

    UPDATE games
    SET 
      name = 'Escribir Números en Palabras',
      description = '¡Aprende a escribir los números en palabras! Arrastra las palabras para formar la respuesta correcta.',
      route = '/alumno/juegos/escritura'
    WHERE id = 'game-escritura';

    UPDATE games
    SET 
      name = 'Arma la Descomposición y Composición de los números',
      description = '¡Aprende a descomponer y componer números! Descubre el misterio de los valores posicionales.',
      route = '/alumno/juegos/descomposicion'
    WHERE id = 'game-descomposicion';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games
    SET 
      name = 'Juego de Ordenamiento',
      description = 'Ordena números de menor a mayor',
      route = '/juego-ordenamiento'
    WHERE id = 'game-ordenamiento';

    UPDATE games
    SET 
      name = 'Juego de Escritura',
      description = 'Aprende a escribir números correctamente',
      route = '/juego-escritura'
    WHERE id = 'game-escritura';

    UPDATE games
    SET 
      name = 'Juego de Descomposición',
      description = 'Descompone números en unidades, decenas y centenas',
      route = '/juego-descomposicion'
    WHERE id = 'game-descomposicion';
  `);
};


