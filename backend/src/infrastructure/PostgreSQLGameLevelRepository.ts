import { GameLevelRepository } from '../core/infrastructure/GameLevelRepository';
import { GameLevel, GameLevelConfig } from '../core/models/GameLevel';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLGameLevelRepository implements GameLevelRepository {
    private db: DatabaseConnection;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    async findByGameId(gameId: string): Promise<GameLevel[]> {
        try {
            const result = await this.db.query(
                `SELECT * FROM games_levels 
                 WHERE game_id = $1 
                 ORDER BY level ASC`,
                [gameId]
            );

            return result.rows.map((row: any) => this.mapRowToGameLevel(row));
        } catch (error) {
            console.error('Error al buscar niveles por game_id:', error);
            throw error;
        }
    }

    async findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null> {
        try {
            const result = await this.db.query(
                `SELECT * FROM games_levels 
                 WHERE game_id = $1 AND level = $2`,
                [gameId, level]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapRowToGameLevel(result.rows[0]);
        } catch (error) {
            console.error('Error al buscar nivel por game_id y level:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<GameLevel | null> {
        try {
            const result = await this.db.query(
                `SELECT * FROM games_levels WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapRowToGameLevel(result.rows[0]);
        } catch (error) {
            console.error('Error al buscar nivel por id:', error);
            throw error;
        }
    }

    async findActiveByGameId(gameId: string): Promise<GameLevel[]> {
        try {
            const result = await this.db.query(
                `SELECT * FROM games_levels 
                 WHERE game_id = $1 AND is_active = true 
                 ORDER BY level ASC`,
                [gameId]
            );

            return result.rows.map((row: any) => this.mapRowToGameLevel(row));
        } catch (error) {
            console.error('Error al buscar niveles activos por game_id:', error);
            throw error;
        }
    }

    async save(gameLevel: GameLevel): Promise<GameLevel> {
        try {
            const result = await this.db.query(
                `INSERT INTO games_levels 
                 (id, game_id, level, name, description, difficulty, activities_count, config, is_active, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 RETURNING *`,
                [
                    gameLevel.id,
                    gameLevel.gameId,
                    gameLevel.level,
                    gameLevel.name,
                    gameLevel.description,
                    gameLevel.difficulty,
                    gameLevel.activitiesCount,
                    JSON.stringify(gameLevel.config),
                    gameLevel.isActive,
                    gameLevel.createdAt,
                    gameLevel.updatedAt
                ]
            );

            return this.mapRowToGameLevel(result.rows[0]);
        } catch (error) {
            console.error('Error al guardar nivel:', error);
            throw error;
        }
    }

    async update(id: string, gameLevelData: Partial<GameLevel>): Promise<GameLevel | null> {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (gameLevelData.name !== undefined) {
                updates.push(`name = $${paramIndex++}`);
                values.push(gameLevelData.name);
            }
            if (gameLevelData.description !== undefined) {
                updates.push(`description = $${paramIndex++}`);
                values.push(gameLevelData.description);
            }
            if (gameLevelData.difficulty !== undefined) {
                updates.push(`difficulty = $${paramIndex++}`);
                values.push(gameLevelData.difficulty);
            }
            if (gameLevelData.activitiesCount !== undefined) {
                updates.push(`activities_count = $${paramIndex++}`);
                values.push(gameLevelData.activitiesCount);
            }
            if (gameLevelData.config !== undefined) {
                updates.push(`config = $${paramIndex++}`);
                values.push(JSON.stringify(gameLevelData.config));
            }
            if (gameLevelData.isActive !== undefined) {
                updates.push(`is_active = $${paramIndex++}`);
                values.push(gameLevelData.isActive);
            }

            updates.push(`updated_at = $${paramIndex++}`);
            values.push(new Date());
            values.push(id);

            if (updates.length === 1) {
                return this.findById(id);
            }

            const query = `
                UPDATE games_levels 
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await this.db.query(query, values);

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapRowToGameLevel(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar nivel:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.db.query(
                `UPDATE games_levels 
                 SET is_active = false, updated_at = $1 
                 WHERE id = $2
                 RETURNING id`,
                [new Date(), id]
            );

            return result.rows.length > 0;
        } catch (error) {
            console.error('Error al eliminar nivel:', error);
            throw error;
        }
    }

    async findAll(): Promise<GameLevel[]> {
        try {
            const result = await this.db.query(
                `SELECT * FROM games_levels 
                 ORDER BY game_id, level ASC`
            );

            return result.rows.map((row: any) => this.mapRowToGameLevel(row));
        } catch (error) {
            console.error('Error al buscar todos los niveles:', error);
            throw error;
        }
    }

    async getTotalActivitiesCount(gameId: string): Promise<number> {
        try {
            const result = await this.db.query(
                `SELECT SUM(activities_count) as total_activities 
                 FROM games_levels 
                 WHERE game_id = $1`,
                [gameId]
            );

            const total = result.rows[0]?.total_activities;
            return total ? parseInt(total) : 0;
        } catch (error) {
            console.error('Error al obtener total de actividades del juego:', error);
            throw error;
        }
    }

    private mapRowToGameLevel(row: any): GameLevel {
        return new GameLevel(
            row.id,
            row.game_id,
            row.level,
            row.name,
            row.description,
            row.difficulty,
            row.activities_count,
            row.config as GameLevelConfig, // PostgreSQL automáticamente parsea JSONB
            row.is_active,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }
}

