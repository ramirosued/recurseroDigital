/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('games', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    image_url: {
      type: 'varchar(500)',
    },
    route: {
      type: 'varchar(255)',
      notNull: true,
    },
    difficulty_level: {
      type: 'integer',
      default: 1,
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

  pgm.createIndex('games', 'name');

  pgm.createTable('courses_games', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    course_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    game_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    is_enabled: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    order_index: {
      type: 'integer',
      default: 0,
      comment: 'Orden en que aparece el juego en el curso',
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

  pgm.createIndex('courses_games', ['course_id', 'game_id'], { unique: true });
  pgm.createIndex('courses_games', 'course_id');
  pgm.createIndex('courses_games', 'game_id');

  pgm.addConstraint('courses_games', 'fk_courses_games_course', {
    foreignKeys: {
      columns: 'course_id',
      references: 'courses(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('courses_games', 'fk_courses_games_game', {
    foreignKeys: {
      columns: 'game_id',
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('courses_games');
  pgm.dropTable('games');
};

