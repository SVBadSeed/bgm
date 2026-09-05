# Контекст сборки = корень репозитория (pnpm workspace):
#   docker build -f frontend/Dockerfile -t bogema-landing .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json frontend/
COPY directus/package.json directus/
RUN pnpm install --frozen-lockfile --filter @bogema/landing...
COPY frontend frontend
RUN pnpm --filter @bogema/landing build

FROM node:22-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /repo/frontend/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
