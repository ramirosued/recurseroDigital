import { TeacherAlreadyExistsError } from '../../../../src/core/models/exceptions/TeacherAlreadyExistsError';

describe('TeacherAlreadyExistsError Exception', () => {
    it('should create a TeacherAlreadyExistsError with default message', () => {
        const error = new TeacherAlreadyExistsError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(TeacherAlreadyExistsError);
        expect(error.message).toBe('El nombre de usuario ya existe');
        expect(error.name).toBe('TeacherAlreadyExistsError');
    });

    it('should accept custom message', () => {
        const error = new TeacherAlreadyExistsError('Custom message');
        expect(error.message).toBe('Custom message');
        expect(error.name).toBe('TeacherAlreadyExistsError');
    });

    it('should be throwable', () => {
        expect(() => {
            throw new TeacherAlreadyExistsError();
        }).toThrow(TeacherAlreadyExistsError);
    });
});


