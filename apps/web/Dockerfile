FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/web apps/web
COPY tsconfig.base.json ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && npx next build

EXPOSE 3000
CMD ["npx", "--prefix", "apps/web", "next", "start"]
