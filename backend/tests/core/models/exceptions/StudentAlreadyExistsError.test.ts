import { StudentAlreadyExistsError } from '../../../../src/core/models/exceptions/StudentAlreadyExistsError';

describe('StudentAlreadyExistsError Exception', () => {
    it('should create a StudentAlreadyExistsError', () => {
        const error = new StudentAlreadyExistsError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(StudentAlreadyExistsError);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new StudentAlreadyExistsError();
        }).toThrow(StudentAlreadyExistsError);
    });

    it('should accept custom message', () => {
        const error = new StudentAlreadyExistsError('Custom message');
        expect(error.message).toBe('Custom message');
    });
});


