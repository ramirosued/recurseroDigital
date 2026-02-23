/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('students', {
    enable: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
  });

  pgm.addColumn('teachers', {
    enable: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
  });

  pgm.sql('UPDATE students SET enable = true WHERE enable IS NULL');
  pgm.sql('UPDATE teachers SET enable = true WHERE enable IS NULL');
};

exports.down = (pgm) => {
  pgm.dropColumn('students', 'enable');
  pgm.dropColumn('teachers', 'enable');
};

