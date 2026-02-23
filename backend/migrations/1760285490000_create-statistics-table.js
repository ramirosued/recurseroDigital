/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('student_statistics', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    student_id: {
      type: 'varchar(255)',
    },
    game_id: {
      type: 'varchar(255)',
    },
    level: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    activity: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    points: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    total_points: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'Puntos totales acumulados en el juego hasta este momento',
    },
    attempts: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'Número de intentos en esta actividad',
    },
    correct_answers: {
      type: 'integer',
      default: 0,
      comment: 'Número de respuestas correctas en la actividad',
    },
    total_questions: {
      type: 'integer',
      default: 0,
      comment: 'Número total de preguntas en la actividad',
    },
    completion_time: {
      type: 'integer',
      comment: 'Tiempo en segundos para completar la actividad',
    },
    is_completed: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    max_unlocked_level: {
      type: 'integer',
      notNull: true,
      default: 1,
      comment: 'Nivel máximo desbloqueado por el estudiante en este juego',
    },
    session_start_time: {
      type: 'timestamp',
      comment: 'Tiempo de inicio de la sesión de juego',
    },
    session_end_time: {
      type: 'timestamp',
      comment: 'Tiempo de finalización de la sesión de juego',
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

  pgm.createIndex('student_statistics', 'student_id');
  pgm.createIndex('student_statistics', 'game_id');
  pgm.createIndex('student_statistics', ['student_id', 'game_id']);
  pgm.createIndex('student_statistics', ['student_id', 'game_id', 'level']);
  pgm.createIndex('student_statistics', 'created_at');

  pgm.addConstraint('student_statistics', 'fk_student_statistics_student', {
    foreignKeys: {
      columns: 'student_id',
      references: 'students(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('student_statistics', 'fk_student_statistics_game', {
    foreignKeys: {
      columns: 'game_id',
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('student_statistics', 'unique_student_game_level_activity', {
    unique: ['student_id', 'game_id', 'level', 'activity'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('student_statistics');
};
