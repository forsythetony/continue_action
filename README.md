# Continue GitHub Action

This GitHub Action processes markdown files with frontmatter and syncs the content to Confluence.

## Features

- Automatically process markdown files with frontmatter metadata
- Create new pages in Confluence
- Update existing pages in Confluence
- Support for custom frontmatter delimiters
- Detailed reporting of sync operations

## Usage

Add this GitHub Action to your workflow:

```yaml
- uses: actions/continue@v1
  with:
    confluence-token: ${{ secrets.CONFLUENCE_TOKEN }}
    confluence-url: https://mycompany.atlassian.net/wiki
    files-path: './docs/**/*.md'
```

## Input Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| confluence-token | API token for Confluence authentication | Yes | - |
| confluence-url | The base URL for your Confluence instance | No | https://confluence.atlassian.com |
| files-path | Glob pattern for markdown files with frontmatter to process | No | './**/*.md' |
| default-space-key | Default Confluence space key if not specified in frontmatter | No | - |
| create-missing | Create pages in Confluence if they don't exist | No | true |
| update-existing | Update existing pages in Confluence | No | true |
| frontmatter-delimiter | The delimiter used in frontmatter (yaml, toml, etc.) | No | '---' |

## Frontmatter Format

The action expects markdown files with frontmatter that includes Confluence-specific metadata. Example:

```markdown
---
title: My Document Title
confluence:
  space_key: TEAM
  parent_id: 123456
  page_id: 789012 # Optional, for updating existing pages
  labels: ["documentation", "api"]
  status: publish # Options: publish, draft
---

# Document Content

This is the content that will be synced to Confluence.
```

## Outputs

| Output | Description |
|--------|-------------|
| success | Boolean indicating if all operations were successful |
| pages_created | Number of new pages created in Confluence |
| pages_updated | Number of existing pages updated in Confluence |
| pages_skipped | Number of pages skipped (no changes or errors) |
| summary | Summary of actions taken for each processed file |

## License

MIT