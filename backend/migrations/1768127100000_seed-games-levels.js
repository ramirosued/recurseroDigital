/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * Migration para poblar la tabla games_levels con la configuración inicial
 * 
 * Datos basados en las configuraciones actuales del frontend:
 * - JuegoOrdenamiento: 3 niveles (3, 4, 5 dígitos)
 * - JuegoDescomposicion: 3 niveles (0-99, 100-999, 1000-9999)
 * - JuegoEscala: 3 niveles (Vecinos Cercanos, Saltos de 10, Grandes Saltos)
 * - JuegoCalculos: 3 niveles para cada operación (suma, resta, multiplicación)
 * - JuegoEscritura: 3 niveles (1-50, 51-200, 201-500)
 */
exports.up = (pgm) => {
  // Juego de Ordenamiento
  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config) VALUES
    -- Juego de Ordenamiento
    ('level-ordenamiento-1', 'game-ordenamiento', 1, 'Nivel 1', 'Números de 3 dígitos', 'Fácil', 5, 
      '{"min": 100, "max": 999, "color": "blue", "numbersCount": 6}'::jsonb),
    ('level-ordenamiento-2', 'game-ordenamiento', 2, 'Nivel 2', 'Números de 4 dígitos', 'Intermedio', 5, 
      '{"min": 1000, "max": 9999, "color": "green", "numbersCount": 6}'::jsonb),
    ('level-ordenamiento-3', 'game-ordenamiento', 3, 'Nivel 3', 'Números de 5 dígitos', 'Avanzado', 5, 
      '{"min": 10000, "max": 99999, "color": "purple", "numbersCount": 6}'::jsonb),

    -- Juego de Descomposición
    ('level-descomposicion-1', 'game-descomposicion', 1, 'Fácil', '0 al 99', 'Fácil', 5, 
      '{"min": 10, "max": 99, "color": "chocolate", "range": "0 al 99"}'::jsonb),
    ('level-descomposicion-2', 'game-descomposicion', 2, 'Intermedio', '100 al 999', 'Intermedio', 5, 
      '{"min": 100, "max": 999, "color": "terracotta", "range": "100 al 999"}'::jsonb),
    ('level-descomposicion-3', 'game-descomposicion', 3, 'Avanzado', '1.000 al 9.999', 'Avanzado', 5, 
      '{"min": 1000, "max": 9999, "color": "chocolate", "range": "1.000 al 9.999"}'::jsonb),

    -- Juego de Escala
    ('level-escala-1', 'game-escala', 1, 'Vecinos Cercanos', 'Encuentra el anterior y posterior (+1 y -1)', 'Fácil', 5, 
      '{"min": 5, "max": 95, "operation": 1, "color": "blue", "range": "1 al 100"}'::jsonb),
    ('level-escala-2', 'game-escala', 2, 'Saltos de 10', 'Encuentra el anterior y posterior (+10 y -10)', 'Intermedio', 5, 
      '{"min": 30, "max": 490, "operation": 10, "color": "green", "range": "20 al 500"}'::jsonb),
    ('level-escala-3', 'game-escala', 3, 'Grandes Saltos', 'Encuentra el anterior y posterior (+100 y -100)', 'Avanzado', 5, 
      '{"min": 300, "max": 900, "operation": 100, "color": "purple", "range": "200 al 1000"}'::jsonb),

    -- Juego de Escritura
    ('level-escritura-1', 'game-escritura', 1, 'Nivel 1', 'Números del 1 al 50', 'Fácil', 5, 
      '{"min": 1, "max": 50, "color": "blue"}'::jsonb),
    ('level-escritura-2', 'game-escritura', 2, 'Nivel 2', 'Números del 51 al 200', 'Intermedio', 5, 
      '{"min": 51, "max": 200, "color": "green"}'::jsonb),
    ('level-escritura-3', 'game-escritura', 3, 'Nivel 3', 'Números del 201 al 500', 'Avanzado', 5, 
      '{"min": 201, "max": 500, "color": "purple"}'::jsonb),

    -- Juego de Cálculos - Suma (levels 1-3)
    ('level-calculos-suma-1', 'game-calculos', 1, 'Nivel 1 - Sumas', '¡Principiante! Operaciones simples', 'Fácil', 5, 
      '{"operation": "suma", "color": "from-green-400 to-emerald-500", "icon": "➕"}'::jsonb),
    ('level-calculos-suma-2', 'game-calculos', 2, 'Nivel 2 - Sumas', '¡Intermedio! Un poco más difícil', 'Intermedio', 5, 
      '{"operation": "suma", "color": "from-blue-400 to-indigo-500", "icon": "➕"}'::jsonb),
    ('level-calculos-suma-3', 'game-calculos', 3, 'Nivel 3 - Sumas', '¡Experto! El desafío máximo', 'Avanzado', 5, 
      '{"operation": "suma", "color": "from-purple-400 to-pink-500", "icon": "➕"}'::jsonb),

    -- Juego de Cálculos - Resta (levels 4-6)
    ('level-calculos-resta-1', 'game-calculos', 4, 'Nivel 1 - Restas', '¡Principiante! Operaciones simples', 'Fácil', 5, 
      '{"operation": "resta", "color": "from-red-400 to-pink-500", "icon": "➖"}'::jsonb),
    ('level-calculos-resta-2', 'game-calculos', 5, 'Nivel 2 - Restas', '¡Intermedio! Un poco más difícil', 'Intermedio', 5, 
      '{"operation": "resta", "color": "from-blue-400 to-indigo-500", "icon": "➖"}'::jsonb),
    ('level-calculos-resta-3', 'game-calculos', 6, 'Nivel 3 - Restas', '¡Experto! El desafío máximo', 'Avanzado', 5, 
      '{"operation": "resta", "color": "from-purple-400 to-pink-500", "icon": "➖"}'::jsonb),

    -- Juego de Cálculos - Multiplicación (levels 7-9)
    ('level-calculos-multiplicacion-1', 'game-calculos', 7, 'Nivel 1 - Multiplicación', '¡Principiante! Operaciones simples', 'Fácil', 5, 
      '{"operation": "multiplicacion", "color": "from-blue-400 to-indigo-500", "icon": "✖️"}'::jsonb),
    ('level-calculos-multiplicacion-2', 'game-calculos', 8, 'Nivel 2 - Multiplicación', '¡Intermedio! Un poco más difícil', 'Intermedio', 5, 
      '{"operation": "multiplicacion", "color": "from-blue-400 to-indigo-500", "icon": "✖️"}'::jsonb),
    ('level-calculos-multiplicacion-3', 'game-calculos', 9, 'Nivel 3 - Multiplicación', '¡Experto! El desafío máximo', 'Avanzado', 5, 
      '{"operation": "multiplicacion", "color": "from-purple-400 to-pink-500", "icon": "✖️"}'::jsonb)
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM games_levels WHERE id IN (
      'level-ordenamiento-1', 'level-ordenamiento-2', 'level-ordenamiento-3',
      'level-descomposicion-1', 'level-descomposicion-2', 'level-descomposicion-3',
      'level-escala-1', 'level-escala-2', 'level-escala-3',
      'level-escritura-1', 'level-escritura-2', 'level-escritura-3',
      'level-calculos-suma-1', 'level-calculos-suma-2', 'level-calculos-suma-3',
      'level-calculos-resta-1', 'level-calculos-resta-2', 'level-calculos-resta-3',
      'level-calculos-multiplicacion-1', 'level-calculos-multiplicacion-2', 'level-calculos-multiplicacion-3'
    )
  `);
};

