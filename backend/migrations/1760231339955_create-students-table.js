/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('students', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    user_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    lastname: {
      type: 'varchar(255)',
      notNull: true,
    },
    dni: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    course_id: {
      type: 'varchar(255)',
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

  pgm.createIndex('students', 'user_id');
  pgm.createIndex('students', 'dni');
};

exports.down = (pgm) => {
  pgm.dropTable('students');
};

