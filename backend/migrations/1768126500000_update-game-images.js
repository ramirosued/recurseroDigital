/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games
    SET image_url = '/assets/JuegoOrdenamiento-fontpage.png'
    WHERE id = 'game-ordenamiento';

    UPDATE games
    SET image_url = '/assets/NumeroPalabras-fontpage.png'
    WHERE id = 'game-escritura';

    UPDATE games
    SET image_url = '/assets/desco y compo.png'
    WHERE id = 'game-descomposicion';

    UPDATE games
    SET image_url = '/assets/JuegoEscritura-fontpage.png'
    WHERE id = 'game-escala';

    UPDATE games
    SET image_url = '/assets/imagen-juegoCalculos.png'
    WHERE id = 'game-calculos';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games
    SET image_url = '/assets/juego2.png'
    WHERE id = 'game-ordenamiento';

    UPDATE games
    SET image_url = '/assets/juego1.png'
    WHERE id = 'game-escritura';

    UPDATE games
    SET image_url = '/assets/juego1.png'
    WHERE id = 'game-descomposicion';

    UPDATE games
    SET image_url = 'https://example.com/images/game-escala.png'
    WHERE id = 'game-escala';

    UPDATE games
    SET image_url = 'https://example.com/images/game-calculos.png'
    WHERE id = 'game-calculos';
  `);
};

