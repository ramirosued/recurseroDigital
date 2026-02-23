import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';
import { InvalidCredentials } from '../../core/models/exceptions/InvalidCredentials';

interface LoginRequest {
    user: string;
    password: string;
}

interface LoginResponse {
    token?: string;
    error?: string;
}

// Obtener las dependencias del contenedor
const dependencyContainer = DependencyContainer.getInstance();
const loginTeacherUseCase = dependencyContainer.loginTeacherUseCase;
const loginStudentUseCase = dependencyContainer.loginStudentUseCase;
const loginAdminUseCase = dependencyContainer.loginAdminsUseCase;


const loginTeacher = async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<void> => {
    const { user, password } = req.body;

    if (!user) {
        res.status(400).json({ error: 'Falta el usuario' });
        return;
    } 
    
    if (!password) {
        res.status(400).json({ error: 'Falta la contraseña' });
        return;
    } 
    
    try {
        const token = await loginTeacherUseCase.execute(user, password);
        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof InvalidCredentials) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        console.error('Error en loginTeacher:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const loginStudent = async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<void> => {
    const { user, password } = req.body;

    if (!user) {
        res.status(400).json({ error: 'Falta el usuario' });
        return;
    }

    if (!password) {
        res.status(400).json({ error: 'Falta la contraseña' });
        return;
    }

    try {
        const token = await loginStudentUseCase.execute(user, password);
        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof InvalidCredentials) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        console.error('Error en loginStudent:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const loginAdmin = async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<void> => {
    const { user, password } = req.body;

    if (!user) {
        res.status(400).json({ error: 'Falta el usuario' });
        return;
    }

    if (!password) {
        res.status(400).json({ error: 'Falta la contraseña' });
        return;
    }

    try {
        console.log('Intentando login de admin con usuario:', user);
        const token = await loginAdminUseCase.execute(user, password);
        console.log('Token generado para admin:', token ? 'Token presente' : 'Token vacío');
        
        if (!token) {
            console.error('Error: El token generado está vacío');
            res.status(500).json({ error: 'Error al generar el token' });
            return;
        }
        
        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof InvalidCredentials) {
            console.log('Credenciales inválidas para admin:', user);
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        console.error('Error en loginAdmin:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const loginController = { loginTeacher: loginTeacher, loginStudent: loginStudent, loginAdmin: loginAdmin };
