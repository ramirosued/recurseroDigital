import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';
import { SaveGameStatisticsValidationError } from '../../core/models/exceptions/SaveGameStatisticsValidationError';
import { StudentNotFoundError } from '../../core/models/exceptions/StudentNotFoundError';

interface SaveGameStatisticsRequest {
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

interface GetStudentProgressRequest {
    studentId: string;
    gameId?: string;
}

interface GetGameStatisticsRequest {
    gameId: string;
}

const dependencyContainer = DependencyContainer.getInstance();
const saveGameStatisticsUseCase = dependencyContainer.saveGameStatisticsUseCase;
const getStudentProgressUseCase = dependencyContainer.getStudentProgressUseCase;
const getGameStatisticsUseCase = dependencyContainer.getGameStatisticsUseCase;
const generateStudentReportUseCase = dependencyContainer.generateStudentReportUseCase;

const saveGameStatistics = async (
    req: Request<{}, any, SaveGameStatisticsRequest>, 
    res: Response
): Promise<void> => {
    const { 
        studentId, 
        gameId, 
        level, 
        activity, 
        points, 
        attempts, 
        correctAnswers, 
        totalQuestions, 
        completionTime, 
        isCompleted, 
        maxUnlockedLevel
    } = req.body;

    try {
        console.log("Received creation of statistics: ", req.body)
        const statistics = await saveGameStatisticsUseCase.execute({
            studentId,
            gameId,
            level,
            activity,
            points,
            attempts,
            correctAnswers,
            totalQuestions,
            completionTime,
            isCompleted,
            maxUnlockedLevel
        });

        console.log("Processed creation of statistics: ", statistics)
        res.status(201).json({ 
            message: 'Estadísticas guardadas exitosamente',
            statistics: {
                id: statistics.id,
                studentId: statistics.studentId,
                gameId: statistics.gameId,
                level: statistics.level,
                activity: statistics.activity,
                points: statistics.points,
                totalPoints: statistics.totalPoints,
                attempts: statistics.attempts,
                isCompleted: statistics.isCompleted,
                maxUnlockedLevel: statistics.maxUnlockedLevel
            }
        });
    } catch (error) {
        if (error instanceof SaveGameStatisticsValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en saveGameStatistics:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getStudentProgress = async (
    req: Request<GetStudentProgressRequest>, 
    res: Response
): Promise<void> => {
    const { studentId, gameId } = req.params;

    try {
        if (!studentId) {
            res.status(400).json({ error: 'ID del estudiante es obligatorio' });
            return;
        }

        const progress = await getStudentProgressUseCase.execute({
            studentId,
            gameId: gameId || undefined
        });
        
        res.status(200).json(progress);
    } catch (error) {
        console.error('Error en getStudentProgress:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getGameStatistics = async (
    req: Request<GetGameStatisticsRequest>, 
    res: Response
): Promise<void> => {
    const { gameId } = req.params;

    try {
        if (!gameId) {
            res.status(400).json({ error: 'ID del juego es obligatorio' });
            return;
        }

        const statistics = await getGameStatisticsUseCase.execute({
            gameId
        });
        
        res.status(200).json(statistics);
    } catch (error) {
        console.error('Error en getGameStatistics:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const generateStudentReport = async (
    req: Request<{ studentId: string }, any, { recentDays?: number }>,
    res: Response
): Promise<void> => {
    const { studentId } = req.params;
    const { recentDays } = req.body || {};

    try {
        if (!studentId) {
            res.status(400).json({ error: 'ID del estudiante es obligatorio' });
            return;
        }

        const parsedDays = Number(recentDays);
        const reportData = await generateStudentReportUseCase.execute({
            studentId,
            recentDays: !Number.isNaN(parsedDays) ? parsedDays : undefined
        });

        const { report, studentName, studentLastname } = reportData;

        res.status(200).json({
            report,
            studentName,
            studentLastname
        });
    } catch (error) {
        if (error instanceof StudentNotFoundError) {
            res.status(404).json({ error: error.message });
            return;
        }

        if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
            res.status(503).json({
                error: 'Servicio de IA no configurado. Define GEMINI_API_KEY para generar reportes.'
            });
            return;
        }

        console.error('Error en generateStudentReport:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const statisticsController = { 
    saveGameStatistics, 
    getStudentProgress, 
    getGameStatistics,
    generateStudentReport
};
