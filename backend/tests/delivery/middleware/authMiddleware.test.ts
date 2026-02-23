import { Request, Response, NextFunction } from 'express';
import { 
    protectRoute, 
    protectAdminRoute, 
    protectTeacherRoute, 
    protectStudentRoute,
    protectAuthenticatedRoute,
    protectTeacherOrAdminRoute,
    protectStudentOrTeacherRoute,
    AuthenticatedRequest 
} from '../../../src/delivery/middleware/authMiddleWare';
import { DependencyContainer } from '../../../src/config/DependencyContainer';
import { UserRole } from '../../../src/core/models/User';

describe('AuthMiddleware', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let tokenService: any;

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        nextFunction = jest.fn();
        tokenService = DependencyContainer.getInstance().tokenService;
    });

    describe('protectRoute - Basic validations', () => {
        it('should return 401 when no token is provided', () => {
            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ 
                error: 'Token no proporcionado' 
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 when header does not have Bearer format', () => {
            mockRequest.headers = {
                authorization: 'InvalidFormat token123'
            };

            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ 
                error: 'Token no proporcionado' 
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 403 when token is invalid', () => {
            mockRequest.headers = {
                authorization: 'Bearer token_invalido'
            };

            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ 
                error: 'Token inválido o expirado' 
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('protectRoute - Role validation', () => {
        it('should allow access when user role is correct', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should deny access when user role is not allowed', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ 
                error: 'Acceso denegado: no tienes permisos para acceder a este recurso' 
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should allow access when role is in the allowed roles list', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectRoute(UserRole.TEACHER, UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.role).toBe(UserRole.TEACHER);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('protectAdminRoute', () => {
        it('should allow access only to administrators', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectAdminRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
        });

        it('should deny access to teachers', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectAdminRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('protectTeacherRoute', () => {
        it('should allow access only to teachers', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectTeacherRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.TEACHER);
        });

        it('should deny access to students', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectTeacherRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('protectStudentRoute', () => {
        it('should allow access only to students', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectStudentRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.STUDENT);
        });

        it('should deny access to administrators', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectStudentRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('protectAuthenticatedRoute', () => {
        it('should allow access to any authenticated user (admin)', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectAuthenticatedRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should allow access to any authenticated user (teacher)', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectAuthenticatedRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should allow access to any authenticated user (student)', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectAuthenticatedRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('protectTeacherOrAdminRoute', () => {
        it('should allow access to teachers', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectTeacherOrAdminRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.TEACHER);
        });

        it('should allow access to admins', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectTeacherOrAdminRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
        });

        it('should deny access to students', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectTeacherOrAdminRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('protectStudentOrTeacherRoute', () => {
        it('should allow access to students', () => {
            const token = tokenService.generate({
                id: '3',
                username: 'student',
                role: UserRole.STUDENT
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectStudentOrTeacherRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.STUDENT);
        });

        it('should allow access to teachers', () => {
            const token = tokenService.generate({
                id: '2',
                username: 'teacher',
                role: UserRole.TEACHER
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectStudentOrTeacherRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user?.role).toBe(UserRole.TEACHER);
        });

        it('should deny access to admins', () => {
            const token = tokenService.generate({
                id: '1',
                username: 'admin',
                role: UserRole.ADMIN
            });

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectStudentOrTeacherRoute();
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('User information in request', () => {
        it('should attach user information to the request', () => {
            const userPayload = {
                id: '123',
                username: 'testuser',
                role: UserRole.ADMIN
            };

            const token = tokenService.generate(userPayload);

            mockRequest.headers = {
                authorization: `Bearer ${token}`
            };

            const middleware = protectRoute(UserRole.ADMIN);
            
            middleware(
                mockRequest as AuthenticatedRequest,
                mockResponse as Response,
                nextFunction
            );

            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.id).toBe(userPayload.id);
            expect(mockRequest.user?.username).toBe(userPayload.username);
            expect(mockRequest.user?.role).toBe(userPayload.role);
        });
    });
});
