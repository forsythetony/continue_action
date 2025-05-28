const axios = require('axios');
const core = require('@actions/core');

let token = '';
let baseUrl = '';

/**
 * Initialize the Confluence API with authentication token and base URL
 * @param {string} confluenceToken The Confluence API token
 * @param {string} confluenceUrl The base URL for the Confluence instance
 */
function initialize(confluenceToken, confluenceUrl) {
  token = confluenceToken;
  baseUrl = confluenceUrl.endsWith('/') ? confluenceUrl.slice(0, -1) : confluenceUrl;
  
  // Configure axios defaults
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
}

/**
 * Get a Confluence page by ID
 * @param {string} pageId The Confluence page ID
 * @returns {Object} Page data or error
 */
async function getPage(pageId) {
  try {
    const response = await axios.get(`${baseUrl}/rest/api/content/${pageId}?expand=body.storage,version`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    core.error(`Error getting page (ID: ${pageId}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a new page in Confluence
 * @param {string} title The page title
 * @param {string} content The HTML content of the page
 * @param {string} spaceKey The Confluence space key
 * @param {string} parentId The parent page ID
 * @param {Array} labels Array of labels to add to the page
 * @returns {Object} Result of the operation
 */
async function createPage(title, content, spaceKey, parentId, labels = []) {
  try {
    const data = {
      type: 'page',
      title: title,
      space: {
        key: spaceKey
      },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      ancestors: [{
        id: parentId
      }]
    };
    
    const response = await axios.post(`${baseUrl}/rest/api/content`, data);
    
    // Add labels if provided
    if (labels && labels.length > 0) {
      await addLabels(response.data.id, labels);
    }
    
    return {
      success: true,
      pageId: response.data.id,
      url: response.data._links.webui
    };
  } catch (error) {
    core.error(`Error creating page: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update an existing page in Confluence
 * @param {string} pageId The page ID to update
 * @param {string} title The page title
 * @param {string} content The HTML content of the page
 * @param {string} spaceKey The Confluence space key
 * @param {Array} labels Array of labels to add to the page
 * @returns {Object} Result of the operation
 */
async function updatePage(pageId, title, content, spaceKey, labels = []) {
  try {
    // Get the current page to get the version number
    const pageResult = await getPage(pageId);
    
    if (!pageResult.success) {
      return {
        success: false,
        error: `Could not retrieve page information: ${pageResult.error}`
      };
    }
    
    const currentVersion = pageResult.data.version.number;
    
    const data = {
      type: 'page',
      title: title,
      space: {
        key: spaceKey
      },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      version: {
        number: currentVersion + 1
      }
    };
    
    const response = await axios.put(`${baseUrl}/rest/api/content/${pageId}`, data);
    
    // Update labels if provided
    if (labels && labels.length > 0) {
      await updateLabels(pageId, labels);
    }
    
    return {
      success: true,
      pageId: response.data.id,
      url: response.data._links.webui
    };
  } catch (error) {
    core.error(`Error updating page (ID: ${pageId}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add labels to a Confluence page
 * @param {string} pageId The Confluence page ID
 * @param {Array} labels Array of label strings
 * @returns {Object} Result of the operation
 */
async function addLabels(pageId, labels) {
  try {
    const labelObjects = labels.map(label => ({
      prefix: 'global',
      name: label
    }));
    
    await axios.post(`${baseUrl}/rest/api/content/${pageId}/label`, labelObjects);
    
    return {
      success: true
    };
  } catch (error) {
    core.error(`Error adding labels to page (ID: ${pageId}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update labels on a Confluence page (removes existing labels and adds new ones)
 * @param {string} pageId The Confluence page ID
 * @param {Array} labels Array of label strings
 * @returns {Object} Result of the operation
 */
async function updateLabels(pageId, labels) {
  try {
    // First, remove all existing labels
    await axios.delete(`${baseUrl}/rest/api/content/${pageId}/label`);
    
    // Then add the new labels
    return await addLabels(pageId, labels);
  } catch (error) {
    core.error(`Error updating labels on page (ID: ${pageId}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  initialize,
  getPage,
  createPage,
  updatePage,
  addLabels,
  updateLabels
};