import { StudentInvalidRequestError } from '../../../../src/core/models/exceptions/StudentInvalidRequestError';

describe('StudentInvalidRequestError Exception', () => {
    it('should create a StudentInvalidRequestError', () => {
        const error = new StudentInvalidRequestError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(StudentInvalidRequestError);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new StudentInvalidRequestError();
        }).toThrow(StudentInvalidRequestError);
    });

    it('should accept custom message', () => {
        const error = new StudentInvalidRequestError('Custom message');
        expect(error.message).toBe('Custom message');
    });
});


