import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';
import { AssignTeacherToCoursesRequest } from '../../core/usecases/AssignTeacherToCourseUseCase';
import { TeacherNotFoundError } from '../../core/models/exceptions/TeacherNotFoundError';
import { TeacherInvalidRequestError } from '../../core/models/exceptions/TeacherInvalidRequestError';
import { TeacherAlreadyExistsError } from '../../core/models/exceptions/TeacherAlreadyExistsError';
import { AuthenticatedRequest } from '../middleware/authMiddleWare';
import { AddTeacherRequest } from '../../core/usecases/addTeacherUseCase';

interface AssignTeacherResponse {
    message?: string;
    error?: string;
}

const dependencyContainer = DependencyContainer.getInstance();

interface AddTeacherResponse {
    message?: string;
    error?: string;
}

const addTeacher = async (req: Request<{}, AddTeacherResponse, AddTeacherRequest>, res: Response<AddTeacherResponse>): Promise<void> => {
    const { name, surname, email, username, password } = req.body;

    try {
        await dependencyContainer.addTeacherUseCase.execute({
            name,
            surname,
            email,
            username,
            password
        });
        
        res.status(201).json({ message: 'Docente creado exitosamente' });
    } catch (error) {
        if (error instanceof TeacherInvalidRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }
        
        if (error instanceof TeacherAlreadyExistsError) {
            res.status(409).json({ error: error.message });
            return;
        }
        
        console.error('Error en addTeacher:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Usar DatabaseConnection para obtener todos los docentes con enable
        const db = (dependencyContainer.teacherRepository as any).db;
        const result = await db.query(
            `SELECT t.*, u.id as user_id, u.username, u.password_hash, u.role 
             FROM teachers t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.created_at DESC`
        );
        
        res.status(200).json({
            teachers: result.rows.map((row: any) => ({
                id: row.id,
                firstName: row.name,
                lastName: row.surname,
                name: `${row.name} ${row.surname}`,
                surname: row.surname,
                fullName: `${row.name} ${row.surname}`,
                email: row.email,
                username: row.username,
                enable: row.enable ?? true
            }))
        });
    } catch (error) {
        console.error('Error en getAllTeachers:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const assignTeacherToCourses = async (
    req: Request<{}, AssignTeacherResponse, AssignTeacherToCoursesRequest>,
    res: Response<AssignTeacherResponse>
): Promise<void> => {
    const { courseIds } = req.body;
    const { teacherId } = req.params as { teacherId: string };

    try {
        if (!teacherId) {
            res.status(400).json({ error: 'teacherId es requerido' });
            return;
        }

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            res.status(400).json({ error: 'courseIds debe ser un array con al menos un elemento' });
            return;
        }

        const assignTeacherUseCase = dependencyContainer.assignTeacherToCoursesUseCase;

        await assignTeacherUseCase.execute({ teacherId, courseIds });
        
        res.status(200).json({ 
            message: 'Profesor asignado a los cursos exitosamente' 
        });
    } catch (error: any) {
        if (error instanceof TeacherInvalidRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }
        
        if (error.message === 'Profesor no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
            return;
        }
        
        console.error('Error en assignTeacherToCourses:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getTeacherCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        const courses = await dependencyContainer.getTeacherCoursesUseCase.execute({ teacherId: req.user.id });
        res.status(200).json({
            courses: courses.map(course => ({
                id: course.id,
                name: course.name
            }))
        });
    } catch (error: any) {
        console.error('Error en getTeacherCourses:', error);
        if (error instanceof TeacherNotFoundError) {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error instanceof TeacherInvalidRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getMyCourseDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params as { courseId: string };
        
        if (!courseId) {
            res.status(400).json({ error: 'courseId es requerido' });
            return;
        }

        const container = DependencyContainer.getInstance();

        const course = await container.courseRepository.findById(courseId);
        if (!course) {
            res.status(404).json({ error: 'Curso no encontrado' });
            return;
        }

        const studentsResponse = await container.getCourseStudentsUseCase.execute({ courseId });
        const totalEstudiantes = studentsResponse.students.length;

        const enabledGames = await container.courseRepository.getEnabledGamesByCourseId(courseId);
        const juegosActivos = enabledGames.length;

        const calculateTotalProgress = (student: any): number => {
            if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) {
                return 0;
            }
            const progressValues = Object.values(student.progressByGame).map((game: any) => game.averageScore || 0);
            const sum = progressValues.reduce((acc: number, val: number) => acc + val, 0);
            return Math.round(sum / progressValues.length);
        };

        let progresoPromedio = 0;
        if (studentsResponse.students.length > 0) {
            const totalProgress = studentsResponse.students.reduce((sum, student) => {
                const studentProgress = calculateTotalProgress(student);
                return sum + studentProgress;
            }, 0);
            progresoPromedio = Math.round(totalProgress / studentsResponse.students.length);
        }

        const courseDetails = {
            id: courseId,
            name: course.name,
            statistics: {
                totalEstudiantes,
                juegosActivos,
                progresoPromedio
            }
        };
        
        res.status(200).json(courseDetails);
        
    } catch (error: any) {
        console.error('Error en getMyCourseDetails:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const updateTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.params as { teacherId: string };
        const { name, surname, username, email, password, courseIds } = req.body as { 
            name: string;
            surname: string;
            username: string; 
            email: string; 
            password?: string | null;
            courseIds: string[];
        };

        if (!teacherId) {
            res.status(400).json({ error: 'teacherId es requerido' });
            return;
        }

        if (!name || name.trim() === '') {
            res.status(400).json({ error: 'El nombre es requerido' });
            return;
        }

        if (!surname || surname.trim() === '') {
            res.status(400).json({ error: 'El apellido es requerido' });
            return;
        }

        if (!username || username.trim() === '') {
            res.status(400).json({ error: 'El username es requerido' });
            return;
        }

        if (!email || email.trim() === '') {
            res.status(400).json({ error: 'El email es requerido' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            res.status(400).json({ error: 'El email no tiene un formato válido' });
            return;
        }

        if (password && password.trim() !== '' && password.trim().length < 6) {
            res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        if (!Array.isArray(courseIds)) {
            res.status(400).json({ error: 'courseIds debe ser un array' });
            return;
        }

        const useCase = dependencyContainer.updateTeacherUseCase;
        const result = await useCase.execute({ 
            teacherId,
            name: name.trim(),
            surname: surname.trim(),
            username: username.trim(), 
            email: email.trim(),
            password: password || null,
            courseIds
        });

        res.status(200).json({ 
            message: 'Docente actualizado exitosamente', 
            teacher: result 
        });
    } catch (error: any) {
        if (error.message === 'El docente no existe') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message.includes('username ya está en uso')) {
            res.status(409).json({ error: error.message });
            return;
        }
        if (error.message.includes('no existe')) {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en updateTeacher:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.params as { teacherId: string };

        if (!teacherId) {
            res.status(400).json({ error: 'teacherId es requerido' });
            return;
        }

        const useCase = dependencyContainer.deleteTeacherUseCase;
        await useCase.execute({ teacherId });

        res.status(200).json({ message: 'Docente deshabilitado exitosamente' });
    } catch (error: any) {
        if (error.message === 'Profesor no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en deleteTeacher:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

const enableTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.params as { teacherId: string };

        if (!teacherId) {
            res.status(400).json({ error: 'teacherId es requerido' });
            return;
        }

        const useCase = dependencyContainer.enableTeacherUseCase;
        await useCase.execute({ teacherId });

        res.status(200).json({ message: 'Docente reactivado exitosamente' });
    } catch (error: any) {
        if (error.message === 'Profesor no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en enableTeacher:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

export const teacherController = {
    addTeacher,
    getAllTeachers,
    assignTeacherToCourses,
    getTeacherCourses,
    getMyCourseDetails,
    updateTeacher,
    deleteTeacher,
    enableTeacher
};