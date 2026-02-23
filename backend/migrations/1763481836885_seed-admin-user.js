/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO users (id, username, password_hash, role) VALUES
    ('admin-1', 'admin', '$2b$10$Ly5kLmBrzpV/2/W1zgwGQOc65t.RPiKPtMZD16Z6zCuhN7JBgZDJC', 'ADMIN')
    ON CONFLICT (username) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admins (id, user_id, nivel_acceso, permisos) VALUES
    ('admin-1', 'admin-1', 1, ARRAY['all'])
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM admins WHERE id = 'admin-1'");
  pgm.sql("DELETE FROM users WHERE id = 'admin-1'");
};

