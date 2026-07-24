FROM node:22-alpine
RUN addgroup -g 65532 osnova && adduser -D -u 65532 -G osnova osnova
WORKDIR /app
COPY server.mjs /app/server.mjs
USER 65532:65532
ENTRYPOINT ["node", "/app/server.mjs"]
