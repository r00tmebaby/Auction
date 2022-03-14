FROM alpine

ARG SERVER_PORT
ARG DOC_PORT

RUN apk add --update nodejs npm
COPY . /src
COPY package.json ./
COPY package-lock.json ./
RUN npm install 
WORKDIR /src
EXPOSE ${SERVER_PORT} ${DOC_PORT}
ENTRYPOINT [ "node", "app.js" ]