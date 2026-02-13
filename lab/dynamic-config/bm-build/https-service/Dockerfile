FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl \
  && mkdir -p /app/certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /app/certs/server.key \
    -out /app/certs/server.crt \
    -days 365 \
    -subj "/CN=localhost"

COPY server.js /app/server.js

ENV PORT=8450
EXPOSE 8450 8443

CMD ["node", "/app/server.js"]
