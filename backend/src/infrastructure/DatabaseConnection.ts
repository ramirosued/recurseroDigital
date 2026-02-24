import { Pool, PoolClient } from 'pg';
import { spawn } from 'child_process';
import path from 'path';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    this.pool.on('error', (err) => {
      console.error('Error inesperado en PostgreSQL:', err);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private async waitForDatabase(
    maxRetries: number = 10,
    delayMs: number = 2000
  ): Promise<void> {
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
          throw new Error(
            `No se pudo conectar a PostgreSQL después de ${maxRetries} intentos`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  private async runMigrations(): Promise<void> {
    return new Promise((resolve, reject) => {
      const migrateProcess = spawn(
        'npx',
        [
          'node-pg-migrate',
          'up',
          '-m',
          path.join(__dirname, '../../migrations')
        ],
        {
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL
          },
          shell: true
        }
      );

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
          reject(
            new Error(
              `Error al ejecutar migraciones. Código: ${code}\n${output}`
            )
          );
        }
      });
    });
  }

  public async initializeTables(): Promise<void> {
    try {
      console.log('Inicializando base de datos PostgreSQL...');
      await this.waitForDatabase();

      console.log('Ejecutando migraciones...');
      await this.runMigrations();

      console.log('Tablas inicializadas correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      throw error;
    }
  }
}