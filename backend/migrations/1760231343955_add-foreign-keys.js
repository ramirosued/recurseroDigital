/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('students', 'fk_students_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('teachers', 'fk_teachers_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('admins', 'fk_admins_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('courses', 'fk_courses_teacher', {
    foreignKeys: {
      columns: 'teacher_id',
      references: 'teachers(id)',
      onDelete: 'SET NULL',
    },
  });

  pgm.addConstraint('students', 'fk_students_course', {
    foreignKeys: {
      columns: 'course_id',
      references: 'courses(id)',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('students', 'fk_students_course');
  pgm.dropConstraint('courses', 'fk_courses_teacher');
  pgm.dropConstraint('admins', 'fk_admins_user');
  pgm.dropConstraint('teachers', 'fk_teachers_user');
  pgm.dropConstraint('students', 'fk_students_user');
};

