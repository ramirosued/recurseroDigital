import { StudentRepository } from '../infrastructure/StudentRepository';
import { StudentStatisticsRepository } from '../infrastructure/StudentStatisticsRepository';
import { StudentStatistics } from '../models/StudentStatistics';
import { StudentNotFoundError } from '../models/exceptions/StudentNotFoundError';
import { AiTextGenerator } from '../services/AiTextGenerator';
import { StudentStatisticsAggregator } from '../services/StudentStatisticsAggregator';
import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { StudentProgressCalculator } from '../services/StudentProgressCalculator';

export interface GenerateStudentReportRequest {
    studentId: string;
    recentDays?: number;
}

export interface GenerateStudentReportResponse {
    studentId: string;
    studentName: string;
    studentLastname: string;
    report: string;
}

interface GameAggregate {
    gameId: string;
    totalSessions: number;
    totalPoints: number;
    maxUnlockedLevel: number;
    completionRate: number;
    averageAccuracy: number;
    recentSessions: number;
    recentPoints: number;
    lastActivity: Date | null;
}

export class GenerateStudentReportUseCase {
    private readonly studentRepository: StudentRepository;
    private readonly statisticsRepository: StudentStatisticsRepository;
    private readonly aiTextGenerator: AiTextGenerator;
    private readonly statisticsAggregator: StudentStatisticsAggregator;
    private readonly progressCalculator: StudentProgressCalculator;

    constructor(
        studentRepository: StudentRepository,
        statisticsRepository: StudentStatisticsRepository,
        aiTextGenerator: AiTextGenerator,
        gameLevelRepository: GameLevelRepository
    ) {
        this.studentRepository = studentRepository;
        this.statisticsRepository = statisticsRepository;
        this.aiTextGenerator = aiTextGenerator;
        this.statisticsAggregator = new StudentStatisticsAggregator();
        this.progressCalculator = new StudentProgressCalculator(
            statisticsRepository,
            gameLevelRepository
        );
    }

    async execute(request: GenerateStudentReportRequest): Promise<GenerateStudentReportResponse> {
        const student = await this.studentRepository.findById(request.studentId);

        if (!student) {
            throw new StudentNotFoundError();
        }

        const statistics = await this.statisticsRepository.findByStudent(request.studentId);
        const recentDays = request.recentDays ?? 7;
        const now = new Date();
        const windowStart = new Date(now.getTime() - recentDays * 24 * 60 * 60 * 1000);

        if (statistics.length === 0) {
            const fallbackReport = `No se encontraron estadísticas registradas para ${student.name} ${student.lastname}. ` +
                `Pide al estudiante que complete nuevas actividades para poder generar un informe.`;

            return {
                studentId: student.id,
                studentName: student.name,
                studentLastname: student.lastname,
                report: fallbackReport
            };
        }

        const aggregatedStats = this.statisticsAggregator.aggregate(statistics);
        const aggregates = this.aggregateStatistics(statistics, windowStart);
        
        const progressByGameWithPercentage = await this.calculateProgressWithPercentage(
            request.studentId,
            aggregatedStats.progressByGame
        );
        
        const prompt = this.buildPrompt({
            studentName: student.name,
            studentLastname: student.lastname,
            recentDays,
            stats: statistics,
            aggregates,
            progressByGame: progressByGameWithPercentage,
            windowStart,
            now
        });

        const result = await this.aiTextGenerator.generateText(prompt);

        return {
            studentId: student.id,
            studentName: student.name,
            studentLastname: student.lastname,
            report: result.text
        };
    }

    private aggregateStatistics(statistics: StudentStatistics[], windowStart: Date): GameAggregate[] {
        const gamesMap = new Map<string, StudentStatistics[]>();

        statistics.forEach((stat) => {
            if (!gamesMap.has(stat.gameId)) {
                gamesMap.set(stat.gameId, []);
            }
            gamesMap.get(stat.gameId)!.push(stat);
        });

        return Array.from(gamesMap.entries()).map(([gameId, stats]) => {
            const totalSessions = stats.length;
            const totalPoints = stats.reduce((sum, stat) => sum + stat.points, 0);
            const recentSessions = stats.filter((stat) => stat.createdAt >= windowStart).length;
            const recentPoints = stats
                .filter((stat) => stat.createdAt >= windowStart)
                .reduce((sum, stat) => sum + stat.points, 0);
            const maxUnlockedLevel = Math.max(...stats.map((stat) => stat.maxUnlockedLevel));
            const completionRate = (stats.filter((stat) => stat.isCompleted).length / totalSessions) * 100;
            const averageAccuracy = stats.reduce((sum, stat) => sum + stat.getAccuracy(), 0) / totalSessions * 100;
            const lastActivity = stats.reduce(
                (latest, current) => (current.createdAt > latest ? current.createdAt : latest),
                stats[0].createdAt
            );

            return {
                gameId,
                totalSessions,
                totalPoints,
                maxUnlockedLevel,
                completionRate,
                averageAccuracy,
                recentSessions,
                recentPoints,
                lastActivity
            };
        });
    }

    private buildPrompt(params: {
        studentName: string;
        studentLastname: string;
        recentDays: number;
        stats: StudentStatistics[];
        aggregates: GameAggregate[];
        progressByGame: Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }>;
        windowStart: Date;
        now: Date;
    }): string {
        const { studentName, studentLastname, recentDays, stats, aggregates, progressByGame, windowStart, now } = params;

        const gameNames: Record<string, string> = {
            'ordenamiento': 'Ordenamiento',
            'escritura': 'Escritura',
            'descomposicion': 'Descomposición',
            'escala': 'Escala Numérica',
            'calculos': 'Cálculos'
        };

        const perGameDetails = Object.entries(progressByGame).map(([gameId, progress]) => {
            const gameName = gameNames[gameId] || gameId;
            const timeMinutes = Math.round(progress.totalTime / 60);
            const progressPercentage = progress.averageScore;
            
            return `- ${gameName}:
  * Actividades completadas: ${progress.completed}
  * Tiempo total invertido: ${timeMinutes} minutos
  * Progreso: ${progressPercentage}%
  * Total de reintentos: ${progress.totalAttempts}`;
        }).join('\n');

        const totalPoints = stats.reduce((sum, stat) => sum + stat.points, 0);
        const completedLevels = stats.filter((stat) => stat.isCompleted).length;
        const averageAccuracy = stats.length > 0 ? (stats.reduce((sum, stat) => sum + stat.getAccuracy(), 0) / stats.length) * 100 : 0;
        const totalAttempts = stats.reduce((sum, stat) => sum + stat.attempts, 0);
        const lastActivity = stats.length > 0 ? stats.reduce(
            (latest, current) => (current.createdAt > latest ? current.createdAt : latest),
            stats[0].createdAt
        ) : null;

        return `Eres un tutor pedagógico especializado en matemática para nivel primario que redacta reportes pedagógicos detallados en español.

ESTADÍSTICAS POR JUEGO:

${perGameDetails}

MÉTRICAS GENERALES:
- Total de actividades completadas: ${completedLevels}
- Puntos totales acumulados: ${totalPoints}
- Precisión promedio: ${averageAccuracy.toFixed(1)}%
- Total de reintentos: ${totalAttempts}
- Última actividad: ${lastActivity ? this.formatDate(lastActivity) : 'Sin registros'}

INSTRUCCIONES PARA EL REPORTE:

Genera un reporte pedagógico estructurado en el siguiente formato EXACTO:

1. **Resumen General del Estudiante**
   Inicia con "Resumen General del Estudiante" y proporciona una visión general del desempeño en 2-3 oraciones, destacando fortalezas y áreas de mejora principales. Usa referencias genéricas como "el estudiante" o "el alumno", nunca uses nombres propios.

2. **🌟 Puntos Fuertes**
   Lista los juegos donde el estudiante tiene mejor desempeño (alto progreso, pocos reintentos, tiempo eficiente). Para cada juego menciona el progreso porcentual y destaca qué lo hace destacable. Usa referencias genéricas como "el estudiante".

3. **⚠️ A Reforzar**
   Lista los juegos donde el estudiante tiene dificultades (bajo progreso, muchos reintentos, o combinaciones que indiquen falta de comprensión). Para cada juego explica específicamente qué indicadores muestran la dificultad y por qué es preocupante. Usa referencias genéricas como "el estudiante".

4. **💡 Recomendación**
   Proporciona una recomendación pedagógica concreta y accionable (máximo 2-3 oraciones) sobre cómo el docente puede ayudar al estudiante a mejorar.

IMPORTANTE:
- Usa el formato exacto con los títulos: "Resumen General del Estudiante", "🌟 Puntos Fuertes", "⚠️ A Reforzar", "💡 Recomendación"
- Incluye emojis tal como se indican en los títulos
- NO uses nombres propios ni información que pueda identificar al estudiante. Usa siempre referencias genéricas como "el estudiante", "el alumno" o "este estudiante"
- Sé específico con porcentajes, cantidades de actividades y reintentos
- Interpreta los datos: si hay muchos reintentos con bajo progreso, sugiere que está adivinando. Si hay poco tiempo con alto progreso, destaca la eficiencia.
- El reporte debe ser profesional pero accesible para docentes
- Máximo 1 párrafo por sección, excepto el resumen que puede tener 2-3 oraciones`;
    }

    private async calculateProgressWithPercentage(
        studentId: string,
        progressByGame: Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }>
    ): Promise<Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }>> {
        const updatedProgress: Record<string, { completed: number; totalTime: number; averageScore: number; totalAttempts: number }> = {};
        
        for (const [gameId, progress] of Object.entries(progressByGame)) {
            const fullGameId = gameId.startsWith('game-') ? gameId : `game-${gameId}`;
            const progressData = await this.progressCalculator.calculateStudentProgress(studentId, fullGameId);
            
            updatedProgress[gameId] = {
                ...progress,
                averageScore: Math.round(progressData.percentage)
            };
        }
        
        return updatedProgress;
    }

    private normalizeGameId(gameId: string): string {
        return gameId.startsWith('game-') ? gameId.replace('game-', '') : gameId;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}

