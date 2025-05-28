FROM node:16-slim

LABEL maintainer="Continue Action Team"
LABEL org.opencontainers.image.source="https://github.com/actions/continue"
LABEL org.opencontainers.image.description="GitHub Action to sync markdown files with frontmatter to Confluence"
LABEL org.opencontainers.image.licenses="MIT"

COPY . /action
WORKDIR /action

RUN npm ci --production
RUN npm run build

ENTRYPOINT ["node", "/action/dist/index.js"]