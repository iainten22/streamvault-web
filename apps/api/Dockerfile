FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api
COPY tsconfig.base.json ./
RUN cd apps/api && npx tsc && npx tsc-alias

EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
