import { IdGenerator } from '../../src/core/infrastructure/IdGenerator';

export class MockIdGenerator implements IdGenerator {
  private counter = 0;

  generate(): string {
    this.counter++;
    const paddedCounter = this.counter.toString().padStart(8, '0');
    return `00000000-0000-4000-8000-${paddedCounter}00000000`;
  }

  reset(): void {
    this.counter = 0;
  }
}
