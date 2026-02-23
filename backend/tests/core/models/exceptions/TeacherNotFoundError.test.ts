import { TeacherNotFoundError } from '../../../../src/core/models/exceptions/TeacherNotFoundError';

describe('TeacherNotFoundError Exception', () => {
    it('should create a TeacherNotFoundError with correct message', () => {
        const error = new TeacherNotFoundError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(TeacherNotFoundError);
        expect(error.message).toBe('Profesor no encontrado');
        expect(error.name).toBe('TeacherNotFoundError');
    });

    it('should be throwable', () => {
        expect(() => {
            throw new TeacherNotFoundError();
        }).toThrow(TeacherNotFoundError);
        expect(() => {
            throw new TeacherNotFoundError();
        }).toThrow('Profesor no encontrado');
    });
});


