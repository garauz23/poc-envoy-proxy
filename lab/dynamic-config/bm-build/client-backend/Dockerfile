FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl \
  && mkdir -p /app/certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /app/certs/server.key \
    -out /app/certs/server.crt \
    -days 365 \
    -subj "/CN=localhost"

COPY package.json /app/package.json
COPY server.js /app/server.js

ENV PORT=5050
EXPOSE 5050

CMD ["npm", "start"]
