import { TeacherInvalidRequestError } from '../../../../src/core/models/exceptions/TeacherInvalidRequestError';

describe('TeacherInvalidRequestError Exception', () => {
    it('should create a TeacherInvalidRequestError', () => {
        const error = new TeacherInvalidRequestError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(TeacherInvalidRequestError);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new TeacherInvalidRequestError();
        }).toThrow(TeacherInvalidRequestError);
    });

    it('should accept custom message', () => {
        const error = new TeacherInvalidRequestError('Custom message');
        expect(error.message).toBe('Custom message');
    });
});


