import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';
import { AssignGameToCourseUseCase } from '../../core/usecases/AssignGameToCourseUseCase';
import { CreateCourseUseCase } from '../../core/usecases/CreateCourseUseCase';
import { UpdateCourseUseCase } from '../../core/usecases/UpdateCourseUseCase';
import { DeleteCourseUseCase } from '../../core/usecases/DeleteCourseUseCase';
import { GetAllCourseGamesUseCase } from '../../core/usecases/GetAllCourseGamesUseCase';
import { UpdateCourseGameStatusUseCase } from '../../core/usecases/UpdateCourseGameStatusUseCase';

const container = DependencyContainer.getInstance();
const dependencyContainer = DependencyContainer.getInstance();

export const courseController = {
    getAllCourses: async (req: Request, res: Response): Promise<void> => {
        try {
            const courses = await container.courseRepository.getAllCourses();
            res.status(200).json({
                courses: courses.map(course => ({
                    id: course.id,
                    name: course.name,
                    teacherId: course.teacher_id,
                    students: course.students || 0
                }))
            });
        } catch (error: any) {
            console.error('Error en getAllCourses:', error);
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    addGameToCourse: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params as { courseId: string };
            const { gameId } = req.body as { gameId: string };

            if (!gameId) {
                res.status(400).json({ error: 'gameId es requerido' });
                return;
            }

            const useCase = new AssignGameToCourseUseCase(
                container.courseRepository,
                container.uuidGenerator
            );
            await useCase.execute({ courseId, gameId });

            res.status(201).json({ message: 'Juego asignado al curso correctamente' });
        } catch (error: any) {
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    createCourse: async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.body as { name: string };

            if (!name || name.trim() === '') {
                res.status(400).json({ error: 'El nombre del curso es requerido' });
                return;
            }

            const useCase = new CreateCourseUseCase(
                container.courseRepository
            );

            const result = await useCase.execute({ name: name.trim() });

            res.status(201).json({
                message: 'Curso creado exitosamente',
                course: result
            });
        } catch (error: any) {
            if (error.message === 'Ya existe un curso con ese nombre') {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    getCourseStudents: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params as { courseId: string };

            if (!courseId) {
                res.status(400).json({ error: 'courseId es requerido' });
                return;
            }

            const result = await container.getCourseStudentsUseCase.execute({ courseId });
            
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en getCourseStudents:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    updateCourse: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params as { courseId: string };
            const { name } = req.body as { name: string };

            if (!courseId) {
                res.status(400).json({ error: 'courseId es requerido' });
                return;
            }

            if (!name || name.trim() === '') {
                res.status(400).json({ error: 'El nombre del curso es requerido' });
                return;
            }

            const useCase = new UpdateCourseUseCase(container.courseRepository);
            const result = await useCase.execute({ courseId, name: name.trim() });

            res.status(200).json({
                message: 'Curso actualizado exitosamente',
                course: result
            });
        } catch (error: any) {
            if (error.message === 'El curso no existe') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message === 'Ya existe un curso con ese nombre') {
                res.status(409).json({ error: error.message });
                return;
            }
            console.error('Error en updateCourse:', error);
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    deleteCourse: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params as { courseId: string };

            if (!courseId) {
                res.status(400).json({ error: 'courseId es requerido' });
                return;
            }

            const useCase = new DeleteCourseUseCase(container.courseRepository);
            await useCase.execute({ courseId });

            res.status(200).json({
                message: 'Curso eliminado exitosamente'
            });
        } catch (error: any) {
            if (error.message === 'El curso no existe') {
                res.status(404).json({ error: error.message });
                return;
            }
            console.error('Error en deleteCourse:', error);
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    getAllCourseGames: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params as { courseId: string };

            if (!courseId) {
                res.status(400).json({ error: 'courseId es requerido' });
                return;
            }

            const useCase = new GetAllCourseGamesUseCase(container.courseRepository);
            const result = await useCase.execute({ courseId });

            res.status(200).json({
                courseId: result.courseId,
                games: result.games.map(courseGame => ({
                    id: courseGame.id,
                    courseId: courseGame.getCourseId(),
                    gameId: courseGame.getGameId(),
                    isEnabled: courseGame.getIsEnabled(),
                    orderIndex: courseGame.getOrderIndex(),
                    game: courseGame.getGame() ? {
                        id: courseGame.getGame()!.id,
                        name: courseGame.getGame()!.getName(),
                        description: courseGame.getGame()!.getDescription(),
                        imageUrl: courseGame.getGame()!.getImageUrl(),
                        route: courseGame.getGame()!.getRoute(),
                        difficultyLevel: courseGame.getGame()!.getDifficultyLevel(),
                        isActive: courseGame.getGame()!.getIsActive()
                    } : null
                }))
            });
        } catch (error: any) {
            if (error.message === 'courseId es requerido') {
                res.status(400).json({ error: error.message });
                return;
            }
            if (error.message === 'El curso no existe') {
                res.status(404).json({ error: error.message });
                return;
            }
            console.error('Error en getAllCourseGames:', error);
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    updateCourseGameStatus: async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseGameId } = req.params as { courseGameId: string };
            const { isEnabled } = req.body as { isEnabled: boolean };

            if (!courseGameId) {
                res.status(400).json({ error: 'courseGameId es requerido' });
                return;
            }

            if (typeof isEnabled !== 'boolean') {
                res.status(400).json({ error: 'isEnabled debe ser un valor booleano' });
                return;
            }

            const useCase = new UpdateCourseGameStatusUseCase(container.courseRepository);
            await useCase.execute({ courseGameId, isEnabled });

            res.status(200).json({
                message: `Juego ${isEnabled ? 'habilitado' : 'deshabilitado'} correctamente`
            });
        } catch (error: any) {
            if (error.message === 'courseGameId es requerido' || error.message === 'isEnabled debe ser un valor booleano') {
                res.status(400).json({ error: error.message });
                return;
            }
            if (error.message === 'El juego del curso no existe') {
                res.status(404).json({ error: error.message });
                return;
            }
            console.error('Error en updateCourseGameStatus:', error);
            res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
        }
    },

    getCourseStatistics: async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('getCourseStatistics called with params:', req.params);
            console.log('Request URL:', req.url);
            console.log('Request method:', req.method);
            
            const { courseId } = req.params as { courseId: string };

            if (!courseId) {
                console.log('courseId is missing');
                res.status(400).json({ error: 'courseId es requerido' });
                return;
            }

            console.log('Getting course statistics for courseId:', courseId);
            const useCase = dependencyContainer.getCourseProgressByGameUseCase;
            const result = await useCase.execute({ courseId });
            console.log('Course statistics result:', result);

            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en getCourseStatistics:', error);
            console.error('Stack trace:', error?.stack);
            res.status(500).json({ 
                error: error?.message ?? 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            });
        }
    }
};
