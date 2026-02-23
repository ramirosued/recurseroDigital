/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 10, "max": 50, "minResult": 20, "maxResult": 100}'::jsonb
    WHERE id = 'level-calculos-suma-1';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 100, "max": 600, "minResult": 200, "maxResult": 1200}'::jsonb
    WHERE id = 'level-calculos-suma-2';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 1000, "max": 5000, "minResult": 2000, "maxResult": 10000}'::jsonb
    WHERE id = 'level-calculos-suma-3';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 20, "max": 100, "minResult": 10, "maxResult": 50}'::jsonb
    WHERE id = 'level-calculos-resta-1';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 200, "max": 800, "minResult": 100, "maxResult": 500}'::jsonb
    WHERE id = 'level-calculos-resta-2';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 2000, "max": 7000, "minResult": 1000, "maxResult": 5000}'::jsonb
    WHERE id = 'level-calculos-resta-3';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 2, "max": 10, "minResult": 4, "maxResult": 100}'::jsonb
    WHERE id = 'level-calculos-multiplicacion-1';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 2, "max": 10, "minResult": 4, "maxResult": 100, "hasUnknown": true}'::jsonb
    WHERE id = 'level-calculos-multiplicacion-2';
  `);

  pgm.sql(`
    UPDATE games_levels 
    SET config = config || '{"min": 10, "max": 1000, "minResult": 100, "maxResult": 100000, "multiplier": [10, 100, 1000]}'::jsonb
    WHERE id = 'level-calculos-multiplicacion-3';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games_levels 
    SET config = config - 'min' - 'max' - 'minResult' - 'maxResult' - 'hasUnknown' - 'multiplier'
    WHERE id IN (
      'level-calculos-suma-1', 'level-calculos-suma-2', 'level-calculos-suma-3',
      'level-calculos-resta-1', 'level-calculos-resta-2', 'level-calculos-resta-3',
      'level-calculos-multiplicacion-1', 'level-calculos-multiplicacion-2', 'level-calculos-multiplicacion-3'
    );
  `);
};

