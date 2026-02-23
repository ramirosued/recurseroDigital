import { Pool, PoolClient } from 'pg';
import { databaseConfig } from '../config/database';
import { spawn } from 'child_process';
import path from 'path';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool(databaseConfig);

    this.pool.on('error', (err) => {
      console.error('Error inesperado en el cliente PostgreSQL:', err);
    });
  }

  private async waitForDatabase(maxRetries: number = 10, delayMs: number = 2000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('Conexión a PostgreSQL establecida');
        return;
      } catch (error) {
        console.log(`Esperando PostgreSQL... (intento ${i + 1}/${maxRetries})`);
        if (i === maxRetries - 1) {
          throw new Error(`No se pudo conectar a PostgreSQL después de ${maxRetries} intentos`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  private async runMigrations(): Promise<void> {
    return new Promise((resolve, reject) => {
      let databaseUrl = `postgresql://${databaseConfig.user}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;

      if (process.env.NODE_ENV === 'production') {
        databaseUrl += '?sslmode=require';
      }
      
      const migrateProcess = spawn('npx', [
        'node-pg-migrate',
        'up',
        '-m',
        path.join(__dirname, '../../migrations'),
        '--database-url-var',
        'DATABASE_URL'
      ], {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        shell: true
      });

      let output = '';
      migrateProcess.stdout?.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
      });

      migrateProcess.stderr?.on('data', (data) => {
        output += data.toString();
        console.error(data.toString());
      });

      migrateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Migraciones ejecutadas correctamente');
          resolve();
        } else {
          reject(new Error(`Error al ejecutar migraciones. Código: ${code}\n${output}`));
        }
      });
    });
  }

  public async initializeTables(): Promise<void> {
    try {
      await this.waitForDatabase();

      console.log('Ejecutando migraciones...');
      await this.runMigrations();

      console.log('Tablas inicializadas correctamente en PostgreSQL');
    } catch (error) {
      console.error('Error al inicializar las tablas:', error);
      throw error;
    }
  }
}
