const fs = require('fs').promises;
const matter = require('gray-matter');
const core = require('@actions/core');

/**
 * Parse frontmatter from a markdown file
 * @param {string} filePath Path to the markdown file
 * @param {string} delimiter The frontmatter delimiter (default: '---')
 * @returns {Object} Object containing frontmatter data and content
 */
async function parse(filePath, delimiter = '---') {
  try {
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Parse frontmatter
    const options = { 
      delimiters: delimiter
    };
    
    const parsed = matter(fileContent, options);
    
    // Validate required fields
    if (!parsed.data) {
      core.debug(`No frontmatter found in ${filePath}`);
      return null;
    }
    
    return parsed;
  } catch (error) {
    core.error(`Error parsing frontmatter in ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Validate the required Confluence metadata in frontmatter
 * @param {Object} frontmatterData The parsed frontmatter data
 * @param {string} defaultSpaceKey Default space key to use if not in frontmatter
 * @returns {Object} Object containing validation results and error messages
 */
function validateConfluenceMetadata(frontmatterData, defaultSpaceKey) {
  const result = {
    isValid: true,
    errors: []
  };
  
  // Check for title
  if (!frontmatterData.title) {
    result.isValid = false;
    result.errors.push('Missing required field: title');
  }
  
  // Check for confluence object
  const confluence = frontmatterData.confluence || {};
  
  // Check for space key (or use default)
  const spaceKey = confluence.space_key || defaultSpaceKey;
  if (!spaceKey) {
    result.isValid = false;
    result.errors.push('Missing required field: confluence.space_key');
  }
  
  // If page_id is not provided, parent_id is required for creating new pages
  if (!confluence.page_id && !confluence.parent_id) {
    result.isValid = false;
    result.errors.push('For new pages, parent_id is required');
  }
  
  return result;
}

module.exports = {
  parse,
  validateConfluenceMetadata
};