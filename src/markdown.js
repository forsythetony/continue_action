const { marked } = require('marked');
const TurndownService = require('turndown');
const core = require('@actions/core');

/**
 * Convert markdown content to HTML
 * @param {string} markdown The markdown content
 * @returns {string} HTML content
 */
function markdownToHtml(markdown) {
  try {
    return marked(markdown);
  } catch (error) {
    core.error(`Error converting markdown to HTML: ${error.message}`);
    throw error;
  }
}

/**
 * Convert HTML content to markdown
 * @param {string} html The HTML content
 * @returns {string} Markdown content
 */
function htmlToMarkdown(html) {
  try {
    const turndownService = new TurndownService();
    return turndownService.turndown(html);
  } catch (error) {
    core.error(`Error converting HTML to markdown: ${error.message}`);
    throw error;
  }
}

module.exports = {
  markdownToHtml,
  htmlToMarkdown
};