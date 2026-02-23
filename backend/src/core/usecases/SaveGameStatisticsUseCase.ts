import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';
import { StudentStatistics } from '../models/StudentStatistics';
import { SaveGameStatisticsValidationError } from '../models/exceptions/SaveGameStatisticsValidationError';

export interface SaveGameStatisticsRequest {
    studentId: string;
    gameId: string;
    level: number;
    activity: number;
    points: number;
    attempts: number;
    correctAnswers?: number;
    totalQuestions?: number;
    completionTime?: number;
    isCompleted: boolean;
    maxUnlockedLevel?: number;
}

export class SaveGameStatisticsUseCase {
    private statisticsRepository: StudentStatisticsRepository;
    private idGenerator: IdGenerator;

    constructor(
        statisticsRepository: StudentStatisticsRepository,
        idGenerator: IdGenerator
    ) {
        this.statisticsRepository = statisticsRepository;
        this.idGenerator = idGenerator;
    }

    async execute(request: SaveGameStatisticsRequest): Promise<StudentStatistics> {
        this.validate(request);

        const existingStats = await this.statisticsRepository.findLatestStatistics(
            request.studentId, 
            request.gameId
        );

        const totalPoints = existingStats 
            ? existingStats.totalPoints + request.points 
            : request.points;

        const maxUnlockedLevel = request.maxUnlockedLevel || request.level;

        const statistics = new StudentStatistics(
            this.idGenerator.generate(),
            request.studentId,
            request.gameId,
            request.level,
            request.activity,
            request.points,
            totalPoints,
            request.attempts,
            request.isCompleted,
            maxUnlockedLevel,
            new Date(),
            new Date(),
            request.correctAnswers,
            request.totalQuestions,
            request.completionTime
        );

        await this.statisticsRepository.saveStatistics(statistics);
        return statistics;
    }

    private validate(request: SaveGameStatisticsRequest): void {
        const requiredFields: Array<keyof SaveGameStatisticsRequest> = [
            'studentId',
            'gameId',
            'level',
            'activity',
            'points',
            'attempts',
            'isCompleted'
        ];

        for (const field of requiredFields) {
            const value = request[field];
            if (value === undefined || value === null || value === '') {
                throw new SaveGameStatisticsValidationError(`El campo ${field} es obligatorio`);
            }
        }

        if (request.level < 1) {
            throw new SaveGameStatisticsValidationError('El campo level debe ser mayor o igual a 1');
        }

        if (request.activity < 1) {
            throw new SaveGameStatisticsValidationError('El campo activity debe ser mayor o igual a 1');
        }

        if (request.points < 0) {
            throw new SaveGameStatisticsValidationError('El campo points debe ser mayor o igual a 0');
        }

        if (request.attempts < 0) {
            throw new SaveGameStatisticsValidationError('El campo attempts debe ser mayor o igual a 0');
        }
    }
}
