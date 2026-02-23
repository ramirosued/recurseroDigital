import { StudentNotFoundError } from '../../../../src/core/models/exceptions/StudentNotFoundError';

describe('StudentNotFoundError Exception', () => {
    it('should create a StudentNotFoundError with correct message', () => {
        const error = new StudentNotFoundError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(StudentNotFoundError);
        expect(error.message).toBe('Estudiante no encontrado');
        expect(error.name).toBe('StudentNotFoundError');
    });

    it('should be throwable', () => {
        expect(() => {
            throw new StudentNotFoundError();
        }).toThrow(StudentNotFoundError);
        expect(() => {
            throw new StudentNotFoundError();
        }).toThrow('Estudiante no encontrado');
    });
});


