/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumn('student_statistics', 'session_start_time');
  pgm.dropColumn('student_statistics', 'session_end_time');
};

exports.down = (pgm) => {
  pgm.addColumns('student_statistics', {
    session_start_time: {
      type: 'timestamp',
      comment: 'Tiempo de inicio de la sesión de juego'
    },
    session_end_time: {
      type: 'timestamp',
      comment: 'Tiempo de finalización de la sesión de juego'
    }
  });
};

