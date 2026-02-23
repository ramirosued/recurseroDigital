import { SaveGameStatisticsValidationError } from '../../../../src/core/models/exceptions/SaveGameStatisticsValidationError';

describe('SaveGameStatisticsValidationError Exception', () => {
    it('should create a SaveGameStatisticsValidationError with message', () => {
        const error = new SaveGameStatisticsValidationError('Validation failed');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(SaveGameStatisticsValidationError);
        expect(error.message).toBe('Validation failed');
        expect(error.name).toBe('SaveGameStatisticsValidationError');
    });

    it('should be throwable', () => {
        expect(() => {
            throw new SaveGameStatisticsValidationError('Error message');
        }).toThrow(SaveGameStatisticsValidationError);
        expect(() => {
            throw new SaveGameStatisticsValidationError('Error message');
        }).toThrow('Error message');
    });

    it('should accept different error messages', () => {
        const error1 = new SaveGameStatisticsValidationError('Message 1');
        const error2 = new SaveGameStatisticsValidationError('Message 2');
        expect(error1.message).toBe('Message 1');
        expect(error2.message).toBe('Message 2');
    });
});


