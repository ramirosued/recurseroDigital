import request from 'supertest';
import app from '../../src/config/app';
import { DependencyContainer } from '../../src/config/DependencyContainer';
import { UserRole } from '../../src/core/models/User';

describe('Student Integration Tests', () => {
    let adminToken: string;
    let teacherToken: string;
    let studentToken: string;

    beforeEach(async () => {
        await DependencyContainer.getInstance().clearAllData();

        const tokenService = DependencyContainer.getInstance().tokenService;
        
        adminToken = tokenService.generate({
            id: '1',
            username: 'julian',
            role: UserRole.ADMIN
        });

        teacherToken = tokenService.generate({
            id: '2',
            username: 'teacher',
            role: UserRole.TEACHER
        });

        studentToken = tokenService.generate({
            id: '3',
            username: 'student',
            role: UserRole.STUDENT
        });
    });

    describe('POST /api/student', () => {
        describe('Authentication and Authorization', () => {
            it('should return 401 when no token is provided', async () => {
                const studentData = {
                    name: 'Juan',
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .send(studentData);

                expect(res.statusCode).toBe(401);
                expect(res.body).toHaveProperty('error', 'Token no proporcionado');
            });

            it('should return 403 when token is from a teacher', async () => {
                const studentData = {
                    name: 'Juan',
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${teacherToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(403);
                expect(res.body).toHaveProperty('error', 'Acceso denegado: no tienes permisos para acceder a este recurso');
            });

            it('should return 403 when token is from a student', async () => {
                const studentData = {
                    name: 'Juan',
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${studentToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(403);
                expect(res.body).toHaveProperty('error', 'Acceso denegado: no tienes permisos para acceder a este recurso');
            });
        });

        describe('Happy Path', () => {
            it('should return created 201 when admin adds student successfully', async () => {
                const studentData = {
                    name: 'Juan',
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('message', 'Estudiante creado exitosamente');
            });
        });

        describe('Validation Errors', () => {
            it('should return bad request 400 when required parameter left', async () => {
                const studentData = {
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error');
            });

            it('should return bad request 400 when required parameter is empty', async () => {
                const studentData = {
                    name: '',
                    lastName: 'Pérez',
                    username: 'juan.perez',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error');
            });

            it('should return conflict 409 when username already exists', async () => {
                const studentData = {
                    name: 'Juan',
                    lastName: 'Pérez',
                    username: 'nico@gmail.com',
                    password: 'password123',
                    dni: '12345678'
                };

                const res = await request(app)
                    .post('/api/student')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(studentData);

                expect(res.statusCode).toBe(409);
                expect(res.body).toHaveProperty('error', 'El nombre de usuario ya existe');
            });
        });
    });
});
