/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('courses', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    teacher_id: {
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

  pgm.createIndex('courses', 'name');
  pgm.createIndex('courses', 'teacher_id');
};

exports.down = (pgm) => {
  pgm.dropTable('courses');
};

