/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO games (id, name, description, image_url, route, difficulty_level, is_active)
    VALUES (
      'game-calculos',
      'Cálculos Matemáticos',
      'Juego de operaciones matemáticas con múltiples niveles y actividades.',
      'https://example.com/images/game-calculos.png',
      '/alumno/juegos/calculos',
      2,
      true
    )
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM games WHERE id = 'game-calculos';`);
};

