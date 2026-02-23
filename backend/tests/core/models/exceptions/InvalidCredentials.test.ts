import { InvalidCredentials } from '../../../../src/core/models/exceptions/InvalidCredentials';

describe('InvalidCredentials Exception', () => {
    it('should create an InvalidCredentials error', () => {
        const error = new InvalidCredentials();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InvalidCredentials);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new InvalidCredentials();
        }).toThrow(InvalidCredentials);
    });
});


