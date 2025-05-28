const core = require('@actions/core');
const glob = require('@actions/glob');
const frontmatterParser = require('./frontmatter');
const confluenceAPI = require('./confluence');
const markdownProcessor = require('./markdown');

async function run() {
  // try {
  //   // Get inputs
  //   const confluenceToken = core.getInput('confluence-token', { required: true });
  //   const confluenceUrl = core.getInput('confluence-url');
  //   const filesPath = core.getInput('files-path');
  //   const defaultSpaceKey = core.getInput('default-space-key');
  //   const createMissing = core.getBooleanInput('create-missing');
  //   const updateExisting = core.getBooleanInput('update-existing');
  //   const frontmatterDelimiter = core.getInput('frontmatter-delimiter');

  //   // Initialize Confluence API
  //   confluenceAPI.initialize(confluenceToken, confluenceUrl);

  //   // Find all markdown files
  //   const globber = await glob.create(filesPath);
  //   const files = await globber.glob();
    
  //   core.info(`Found ${files.length} markdown files to process`);
    
  //   // Track statistics
  //   let pagesCreated = 0;
  //   let pagesUpdated = 0;
  //   let pagesSkipped = 0;
  //   let summaryEntries = [];
  //   let allSuccessful = true;

  //   // Process each file
  //   for (const file of files) {
  //     core.info(`Processing file: ${file}`);
      
  //     try {
  //       // Parse frontmatter
  //       const parsedContent = await frontmatterParser.parse(file, frontmatterDelimiter);
        
  //       if (!parsedContent || !parsedContent.data) {
  //         core.info(`Skipping ${file} - No valid frontmatter found`);
  //         pagesSkipped++;
  //         summaryEntries.push({
  //           file,
  //           status: 'skipped',
  //           reason: 'No valid frontmatter found'
  //         });
  //         continue;
  //       }
        
  //       // Extract Confluence metadata
  //       const { title, confluence } = parsedContent.data;
        
  //       if (!title) {
  //         core.info(`Skipping ${file} - No title specified in frontmatter`);
  //         pagesSkipped++;
  //         summaryEntries.push({
  //           file,
  //           status: 'skipped',
  //           reason: 'No title specified in frontmatter'
  //         });
  //         continue;
  //       }
        
  //       const spaceKey = confluence?.space_key || defaultSpaceKey;
        
  //       if (!spaceKey) {
  //         core.info(`Skipping ${file} - No space key specified in frontmatter or default inputs`);
  //         pagesSkipped++;
  //         summaryEntries.push({
  //           file,
  //           status: 'skipped',
  //           reason: 'No space key specified'
  //         });
  //         continue;
  //       }
        
  //       // Convert markdown to HTML
  //       const htmlContent = markdownProcessor.markdownToHtml(parsedContent.content);
        
  //       // Check if the page exists
  //       const pageId = confluence?.page_id;
  //       const parentId = confluence?.parent_id;
  //       const labels = confluence?.labels || [];
        
  //       if (pageId) {
  //         // Update existing page
  //         if (!updateExisting) {
  //           core.info(`Skipping ${file} - Page exists but update-existing is disabled`);
  //           pagesSkipped++;
  //           summaryEntries.push({
  //             file,
  //             status: 'skipped',
  //             reason: 'Page exists but update-existing is disabled'
  //           });
  //           continue;
  //         }
          
  //         const result = await confluenceAPI.updatePage(
  //           pageId,
  //           title,
  //           htmlContent,
  //           spaceKey,
  //           labels
  //         );
          
  //         if (result.success) {
  //           core.info(`Updated page: ${title} (ID: ${pageId})`);
  //           pagesUpdated++;
  //           summaryEntries.push({
  //             file,
  //             status: 'updated',
  //             pageId,
  //             pageUrl: result.url
  //           });
  //         } else {
  //           core.error(`Failed to update page: ${title} (ID: ${pageId}) - ${result.error}`);
  //           allSuccessful = false;
  //           pagesSkipped++;
  //           summaryEntries.push({
  //             file,
  //             status: 'error',
  //             reason: `Failed to update page: ${result.error}`
  //           });
  //         }
  //       } else {
  //         // Create new page
  //         if (!createMissing) {
  //           core.info(`Skipping ${file} - Page doesn't exist but create-missing is disabled`);
  //           pagesSkipped++;
  //           summaryEntries.push({
  //             file,
  //             status: 'skipped',
  //             reason: 'Page doesn\'t exist but create-missing is disabled'
  //           });
  //           continue;
  //         }
          
  //         if (!parentId) {
  //           core.info(`Skipping ${file} - No parent page ID specified for new page`);
  //           pagesSkipped++;
  //           summaryEntries.push({
  //             file,
  //             status: 'skipped',
  //             reason: 'No parent page ID specified for new page'
  //           });
  //           continue;
  //         }
          
  //         const result = await confluenceAPI.createPage(
  //           title,
  //           htmlContent,
  //           spaceKey,
  //           parentId,
  //           labels
  //         );
          
  //         if (result.success) {
  //           core.info(`Created page: ${title} (ID: ${result.pageId})`);
  //           pagesCreated++;
  //           summaryEntries.push({
  //             file,
  //             status: 'created',
  //             pageId: result.pageId,
  //             pageUrl: result.url
  //           });
  //         } else {
  //           core.error(`Failed to create page: ${title} - ${result.error}`);
  //           allSuccessful = false;
  //           pagesSkipped++;
  //           summaryEntries.push({
  //             file,
  //             status: 'error',
  //             reason: `Failed to create page: ${result.error}`
  //           });
  //         }
  //       }
  //     } catch (error) {
  //       core.error(`Error processing file ${file}: ${error.message}`);
  //       allSuccessful = false;
  //       pagesSkipped++;
  //       summaryEntries.push({
  //         file,
  //         status: 'error',
  //         reason: error.message
  //       });
  //     }
  //   }
    
  //   // Set outputs
  //   core.setOutput('success', allSuccessful);
  //   core.setOutput('pages_created', pagesCreated);
  //   core.setOutput('pages_updated', pagesUpdated);
  //   core.setOutput('pages_skipped', pagesSkipped);
  //   core.setOutput('summary', JSON.stringify(summaryEntries, null, 2));
    
  //   // Summary
  //   core.info('--- Summary ---');
  //   core.info(`Total files processed: ${files.length}`);
  //   core.info(`Pages created: ${pagesCreated}`);
  //   core.info(`Pages updated: ${pagesUpdated}`);
  //   core.info(`Pages skipped: ${pagesSkipped}`);
  //   core.info(`Overall success: ${allSuccessful}`);
    
  //   if (!allSuccessful) {
  //     core.warning('Some operations failed. Check the logs for details.');
  //   }
  // } catch (error) {
  //   core.setFailed(`Action failed: ${error.message}`);
  // }

  core.info('Doing something now!');
  console.log('I\'m doing something now!');
}

run();
