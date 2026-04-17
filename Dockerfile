ARG BUN_VERSION=1.3.12

FROM oven/bun:${BUN_VERSION} AS deps

ADD ./patches /app/patches
ADD ./package.json /app/package.json
ADD ./bun.lock /app/bun.lock

WORKDIR /app

RUN bun install -p --backend=copyfile --frozen-lockfile

FROM oven/bun:${BUN_VERSION}

ADD ./build /app

COPY --from=deps /app/node_modules /app/node_modules

WORKDIR /app

CMD ["bun", "./index.js"]