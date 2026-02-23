export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'recurseroDigitalDB',
  user: process.env.DB_USER || 'admindb',
  password: process.env.DB_PASSWORD || 'recursero2025',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};
