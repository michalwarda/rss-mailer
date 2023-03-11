FROM oven/bun

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

USER bun

WORKDIR /app

COPY --chown=bun:bun package.json .
COPY --chown=bun:bun bun.lockb .

RUN bun i --production

COPY --chown=bun:bun . .

RUN mv stubs/http2.js node_modules/googleapis-common/build/src/http2.js

EXPOSE 3000

CMD ["/bin/sh", "-c", "./startup.sh"]
