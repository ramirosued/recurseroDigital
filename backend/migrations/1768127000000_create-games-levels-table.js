/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * Migration para crear la tabla games_levels
 * 
 * Esta tabla almacena la configuración de niveles para cada juego,
 * permitiendo hacer configurable desde el backend lo que antes estaba
 * hardcodeado en el frontend.
 */
exports.up = (pgm) => {
  pgm.createTable('games_levels', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    game_id: {
      type: 'varchar(255)',
      notNull: true,
      comment: 'FK a la tabla games',
    },
    level: {
      type: 'integer',
      notNull: true,
      comment: 'Número del nivel (1, 2, 3, etc.)',
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      comment: 'Nombre del nivel (ej: "Fácil", "Nivel 1", "Vecinos Cercanos")',
    },
    description: {
      type: 'text',
      comment: 'Descripción del nivel',
    },
    difficulty: {
      type: 'varchar(50)',
      comment: 'Dificultad: Fácil, Intermedio, Avanzado',
    },
    activities_count: {
      type: 'integer',
      notNull: true,
      default: 5,
      comment: 'Cantidad de actividades en este nivel',
    },
    config: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
      comment: 'Configuración específica del juego (rangos, operaciones, colores, etc.)',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Índices
  pgm.createIndex('games_levels', 'game_id');
  pgm.createIndex('games_levels', ['game_id', 'level'], { unique: true });

  // Foreign key
  pgm.addConstraint('games_levels', 'fk_games_levels_game', {
    foreignKeys: {
      columns: 'game_id',
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('games_levels');
};

