import { IdGenerator } from '../core/infrastructure/IdGenerator';

export class UUIDGenerator implements IdGenerator {
    private counter = 0;
    
    generate(): string {
        this.counter++;
        const timestamp = Date.now().toString(16);
        const random = Math.random().toString(16).substring(2, 8);
        const counter = this.counter.toString(16).padStart(4, '0');

        return `${timestamp}-${random}-${counter}-${Math.random().toString(16).substring(2, 6)}-${Math.random().toString(16).substring(2, 14)}`;
    }
}
