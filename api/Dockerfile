FROM node:20-alpine

RUN apk update && \
    apk add chromium && \
    rm -rf /var/cache/apk/* 

COPY . /app
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN corepack enable && \
    yarn install && \
    corepack disable

RUN adduser -D -u 1001 bot && \
    mkdir -p /home/bot && \
    chown -R bot:bot /home/bot

USER bot
ENTRYPOINT ["node", "/app/app.js"]
