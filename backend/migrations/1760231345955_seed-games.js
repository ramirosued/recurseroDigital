/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO games (id, name, description, image_url, route, difficulty_level, is_active) VALUES
    ('game-escritura', 'Juego de Escritura', 'Aprende a escribir números correctamente', '/assets/juego1.png', '/juego-escritura', 1, true),
    ('game-ordenamiento', 'Juego de Ordenamiento', 'Ordena números de menor a mayor', '/assets/juego2.png', '/juego-ordenamiento', 1, true),
    ('game-descomposicion', 'Juego de Descomposición', 'Descompone números en unidades, decenas y centenas', '/assets/juego1.png', '/juego-descomposicion', 2, true)
  `);
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM games WHERE id IN ('game-escritura', 'game-ordenamiento', 'game-descomposicion')");
};

