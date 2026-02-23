// Configuración global para los tests
import 'jest';
import { DependencyContainer } from '../src/config/DependencyContainer';

process.env.NODE_ENV = 'test';

beforeAll(async () => {
    const container = DependencyContainer.getInstance();
    await container.clearAllData();
});

beforeEach(async () => {
    const container = DependencyContainer.getInstance();
    await container.clearAllData();
});

afterAll(() => {
    
});
