import { AdminRepository } from '../core/infrastructure/AdminRepository';
import { Admin } from '../core/models/Admin';
import { User, UserRole } from '../core/models/User';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLAdminRepository implements AdminRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findByUserName(userName: string): Promise<Admin | null> {
    try {
      const result = await this.db.query(
        `SELECT a.*, u.username, u.password_hash, u.role 
         FROM admins a 
         JOIN users u ON a.user_id = u.id 
         WHERE u.username = $1`,
        [userName]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.username, row.username, row.password_hash, row.role as UserRole);
      return new Admin(
        row.id,
        row.user_id,
        row.nivel_acceso,
        row.permisos || [],
        user
      );
    } catch (error) {
      console.error('Error al buscar administrador por nombre de usuario:', error);
      throw error;
    }
  }

  async addAdmin(adminData: Admin): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO users (id, username, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        [
          adminData.user.id,
          adminData.user.username,
          adminData.user.passwordHash,
          adminData.user.role
        ]
      );

      await this.db.query(
        `INSERT INTO admins (id, user_id, nivel_acceso, permisos)
         VALUES ($1, $2, $3, $4)`,
        [
          adminData.id,
          adminData.user.id,
          adminData.nivelAcceso,
          adminData.permisos
        ]
      );
    } catch (error) {
      console.error('Error al agregar administrador:', error);
      throw error;
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    try {
      const result = await this.db.query(
        `SELECT a.*, u.username, u.password_hash, u.role 
         FROM admins a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC`
      );
      return result.rows.map((row: any) => {
        const user = new User(row.username, row.username, row.password_hash, row.role);
        return new Admin(
          row.id,
          row.user_id,
          row.nivel_acceso,
          row.permisos || [],
          user
        );
      });
    } catch (error) {
      console.error('Error al obtener todos los administradores:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      const result = await this.db.query(
        `SELECT a.*, u.username, u.password_hash, u.role 
         FROM admins a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = new User(row.username, row.username, row.password_hash, row.role as UserRole);
      return new Admin(
        row.id,
        row.user_id,
        row.nivel_acceso,
        row.permisos || [],
        user
      );
    } catch (error) {
      console.error('Error al buscar administrador por ID:', error);
      throw error;
    }
  }

  async updateAdmin(adminData: Admin): Promise<void> {
    try {
      await this.db.query(
        `UPDATE users 
         SET username = $2, password_hash = $3, role = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          adminData.user.id,
          adminData.user.username,
          adminData.user.passwordHash,
          adminData.user.role
        ]
      );

      await this.db.query(
        `UPDATE admins 
         SET nivel_acceso = $2, permisos = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          adminData.id,
          adminData.nivelAcceso,
          adminData.permisos
        ]
      );
    } catch (error) {
      console.error('Error al actualizar administrador:', error);
      throw error;
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    try {
      const admin = await this.findById(id);
      if (!admin) {
        throw new Error('Administrador no encontrado');
      }

      await this.db.query('DELETE FROM admins WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      throw error;
    }
  }
}
