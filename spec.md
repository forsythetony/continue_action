# GitHub Action: Continue

This document defines the specifications for a GitHub Action called "continue".

## Overview

The "continue" action processes markdown files with frontmatter to extract metadata and syncs this content with Confluence. It analyzes the frontmatter in your files to determine what actions to take, then communicates with Confluence using the provided API token.

## Usage

To use this action in your workflow, include the following in your workflow YAML file:

```yaml
- uses: actions/continue@v1
  with:
    confluence-token: ${{ secrets.CONFLUENCE_TOKEN }}
```
