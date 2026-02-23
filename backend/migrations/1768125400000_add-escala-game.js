/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO games (id, name, description, image_url, route, difficulty_level, is_active)
    VALUES (
      'game-escala',
      'Escribí el número anterior y el posterior',
      '¡Explora los números anteriores y posteriores! Completa secuencias y descubre patrones numéricos.',
      'https://example.com/images/game-escala.png',
      '/alumno/juegos/escala',
      2,
      true
    )
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM games WHERE id = 'game-escala';`);
};

