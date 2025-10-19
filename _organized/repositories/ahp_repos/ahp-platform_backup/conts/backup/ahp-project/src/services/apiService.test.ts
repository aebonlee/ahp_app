import apiService from './apiService';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('apiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should export API service modules', () => {
    expect(apiService).toBeDefined();
    expect(apiService.projectAPI).toBeDefined();
    expect(apiService.resultsAPI).toBeDefined();
    expect(apiService.evaluatorAPI).toBeDefined();
  });

  it('should have project API as object', () => {
    expect(typeof apiService.projectAPI).toBe('object');
    expect(apiService.projectAPI).not.toBeNull();
  });

  it('should have results API as object', () => {
    expect(typeof apiService.resultsAPI).toBe('object');
    expect(apiService.resultsAPI).not.toBeNull();
  });

  it('should handle basic API structure', () => {
    const apiModules = Object.keys(apiService);
    expect(apiModules.length).toBeGreaterThan(0);
    expect(apiModules).toContain('projectAPI');
  });
});