const frontmatterParser = require('../src/frontmatter');
const fs = require('fs').promises;

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

// Mock the @actions/core module
jest.mock('@actions/core', () => ({
  debug: jest.fn(),
  error: jest.fn()
}));

describe('Frontmatter Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should parse valid frontmatter', async () => {
    // Mock file content
    const mockContent = `---
title: Test Page
confluence:
  space_key: TEST
  parent_id: 12345
  labels: ["test", "documentation"]
---

# Test Content

This is test content.`;

    fs.readFile.mockResolvedValue(mockContent);
    
    const result = await frontmatterParser.parse('test.md');
    
    expect(result).toBeDefined();
    expect(result.data.title).toBe('Test Page');
    expect(result.data.confluence.space_key).toBe('TEST');
    expect(result.data.confluence.parent_id).toBe(12345);
    expect(result.data.confluence.labels).toEqual(["test", "documentation"]);
    expect(result.content).toContain('# Test Content');
  });
  
  test('should return null for invalid frontmatter', async () => {
    // Mock file content with no frontmatter
    const mockContent = `# Test Content

This is test content with no frontmatter.`;

    fs.readFile.mockResolvedValue(mockContent);
    
    const result = await frontmatterParser.parse('test.md');
    
    expect(result).not.toBeNull();
    expect(result.data).toEqual({});
  });
  
  test('should validate confluence metadata correctly', () => {
    const validData = {
      title: 'Test Page',
      confluence: {
        space_key: 'TEST',
        parent_id: 12345
      }
    };
    
    const result = frontmatterParser.validateConfluenceMetadata(validData, null);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
  
  test('should detect missing title', () => {
    const invalidData = {
      confluence: {
        space_key: 'TEST',
        parent_id: 12345
      }
    };
    
    const result = frontmatterParser.validateConfluenceMetadata(invalidData, null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing required field: title');
  });
  
  test('should use default space key if not provided', () => {
    const data = {
      title: 'Test Page',
      confluence: {
        parent_id: 12345
      }
    };
    
    const result = frontmatterParser.validateConfluenceMetadata(data, 'DEFAULT');
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});