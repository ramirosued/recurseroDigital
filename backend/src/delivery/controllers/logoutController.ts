import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';

interface LogoutRequest {
    token: string;
}

interface LogoutResponse {
    message?: string;
    error?: string;
}



const logout = async (req: Request<{}, LogoutResponse, LogoutRequest>, res: Response<LogoutResponse>): Promise<void> => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.status(400).json({ error: 'Falta el token' });
        return;
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
    });
    res.json({ message: 'Sesión cerrada correctamente' });

};


export const logoutController = {logout: logout
};

