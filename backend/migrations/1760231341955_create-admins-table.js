/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('admins', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    user_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    nivel_acceso: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    permisos: {
      type: 'text[]',
      default: pgm.func("'{}'"),
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

  pgm.createIndex('admins', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('admins');
};

