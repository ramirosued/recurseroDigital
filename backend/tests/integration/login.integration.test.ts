import request from 'supertest';
import app from '../../src/config/app';
import { DependencyContainer } from '../../src/config/DependencyContainer';

describe('Login Integration Tests', () => {
  beforeEach(async () => {
    await DependencyContainer.getInstance().clearAllData();
  });
  
  describe('POST /api/login/admin', () => {
    describe('Validaciones de parámetros', () => {
      it('debe devolver 400 cuando no se ingresa el parámetro usuario', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ password: 'admin123' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta el usuario');
      });

      it('debe devolver 400 cuando no se ingresa el parámetro password', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ user: 'admin' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta la contraseña');
      });
    });

    describe('Validaciones de credenciales', () => {
      it('debe devolver 401 cuando el usuario admin es inválido', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ user: 'admin_inexistente', password: 'admin123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });

      it('debe devolver 401 cuando la contraseña del admin es inválida', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ user: 'admin', password: 'password_incorrecta' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });
    });

    describe('Login exitoso de admin', () => {
      it('debe devolver 200 y un token cuando las credenciales de admin son correctas', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ user: 'julian', password: 'Recursero2025!' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(0);
      });

      it('debe devolver un token JWT válido para admin', async () => {
        const res = await request(app)
          .post('/api/login/admin')
          .send({ user: 'julian', password: 'Recursero2025!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      });
    });
  });

  describe('POST /api/login/teacher', () => {
    describe('Validaciones de parámetros', () => {
      it('debe devolver 400 cuando no se ingresa el parámetro usuario', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ password: 'teacher123' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta el usuario');
      });

      it('debe devolver 400 cuando no se ingresa el parámetro password', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ user: 'teacher' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta la contraseña');
      });
    });

    describe('Validaciones de credenciales', () => {
      it('debe devolver 401 cuando el usuario teacher es inválido', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ user: 'teacher_inexistente', password: 'teacher123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });

      it('debe devolver 401 cuando la contraseña del teacher es inválida', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ user: 'teacher', password: 'password_incorrecta' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });
    });

    describe('Login exitoso de teacher', () => {
      it('debe devolver 200 y un token cuando las credenciales de teacher son correctas', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ user: 'Mariana@gmail.com', password: 'abcd1234' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(0);
      });

      it('debe devolver un token JWT válido para teacher', async () => {
        const res = await request(app)
          .post('/api/login/teacher')
          .send({ user: 'Mariana@gmail.com', password: 'abcd1234' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      });
    });
  });

  // Tests para Login de Student
  describe('POST /api/login/student', () => {
    describe('Validaciones de parámetros', () => {
      it('debe devolver 400 cuando no se ingresa el parámetro usuario', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ password: 'student123' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta el usuario');
      });

      it('debe devolver 400 cuando no se ingresa el parámetro password', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ user: 'student' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Falta la contraseña');
      });
    });

    describe('Validaciones de credenciales', () => {
      it('debe devolver 401 cuando el usuario student es inválido', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ user: 'student_inexistente', password: 'student123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });

      it('debe devolver 401 cuando la contraseña del student es inválida', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ user: 'student', password: 'password_incorrecta' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
      });
    });

    describe('Login exitoso de student', () => {
      it('debe devolver 200 y un token cuando las credenciales de student son correctas', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ user: 'nico@gmail.com', password: 'Recursero2025!' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(0);
      });

      it('debe devolver un token JWT válido para student', async () => {
        const res = await request(app)
          .post('/api/login/student')
          .send({ user: 'nico@gmail.com', password: 'Recursero2025!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      });
    });
  });

  // Tests de separación de roles
  describe('Separación de roles', () => {
    it('no debe permitir login de student en endpoint de admin', async () => {
      const res = await request(app)
        .post('/api/login/admin')
        .send({ user: 'nico@gmail.com', password: 'Recursero2025!' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    it('no debe permitir login de teacher en endpoint de student', async () => {
      const res = await request(app)
        .post('/api/login/student')
        .send({ user: 'Mariana@gmail.com', password: 'abcd1234' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    it('no debe permitir login de admin en endpoint de teacher', async () => {
      const res = await request(app)
        .post('/api/login/teacher')
        .send({ user: 'julian', password: 'Recursero2025!' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });
  });
});
