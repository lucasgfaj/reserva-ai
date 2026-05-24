import { jest } from '@jest/globals';

jest.mock('bcrypt', () => ({
  hash: jest.fn<(...args: any[]) => Promise<string>>().mockResolvedValue('hashed_password'),
}));
