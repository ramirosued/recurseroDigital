/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * Migration para actualizar los niveles del juego de ordenamiento
 * según los rangos pedagógicos apropiados por grado escolar:
 * 
 * - Nivel 1: 0 a 99 (números de 1-2 dígitos)
 * - Nivel 2: 100 a 999 (números de 3 dígitos)  
 * - Nivel 3: 1.000 a 9.999 (números de 4 dígitos)
 * 
 * Esta migración reemplaza los rangos existentes con valores más apropiados
 * para el aprendizaje progresivo de matemáticas en primaria.
 */
exports.up = (pgm) => {
  pgm.sql(`
    -- Actualizar Nivel 1: Cambiar de números de 3 dígitos a números del 0 al 99
    UPDATE games_levels 
    SET 
      description = 'Números del 0 al 99',
      config = jsonb_set(
        jsonb_set(config, '{min}', '0'),
        '{max}', '99'
      )
    WHERE id = 'level-ordenamiento-1' AND game_id = 'game-ordenamiento';

    -- Actualizar Nivel 2: Cambiar de números de 4 dígitos a números del 100 al 999
    UPDATE games_levels 
    SET 
      description = 'Números del 100 al 999',
      config = jsonb_set(
        jsonb_set(config, '{min}', '100'),
        '{max}', '999'
      )
    WHERE id = 'level-ordenamiento-2' AND game_id = 'game-ordenamiento';

    -- Actualizar Nivel 3: Cambiar de números de 5 dígitos a números del 1.000 al 9.999
    UPDATE games_levels 
    SET 
      description = 'Números del 1.000 al 9.999',
      config = jsonb_set(
        jsonb_set(config, '{min}', '1000'),
        '{max}', '9999'
      )
    WHERE id = 'level-ordenamiento-3' AND game_id = 'game-ordenamiento';
  `);
};

/**
 * Rollback: Restaurar los valores originales
 */
exports.down = (pgm) => {
  pgm.sql(`
    -- Revertir Nivel 1: Volver a números de 3 dígitos
    UPDATE games_levels 
    SET 
      description = 'Números de 3 dígitos',
      config = jsonb_set(
        jsonb_set(config, '{min}', '100'),
        '{max}', '999'
      )
    WHERE id = 'level-ordenamiento-1' AND game_id = 'game-ordenamiento';

    -- Revertir Nivel 2: Volver a números de 4 dígitos
    UPDATE games_levels 
    SET 
      description = 'Números de 4 dígitos',
      config = jsonb_set(
        jsonb_set(config, '{min}', '1000'),
        '{max}', '9999'
      )
    WHERE id = 'level-ordenamiento-2' AND game_id = 'game-ordenamiento';

    -- Revertir Nivel 3: Volver a números de 5 dígitos
    UPDATE games_levels 
    SET 
      description = 'Números de 5 dígitos',
      config = jsonb_set(
        jsonb_set(config, '{min}', '10000'),
        '{max}', '99999'
      )
    WHERE id = 'level-ordenamiento-3' AND game_id = 'game-ordenamiento';
  `);
};