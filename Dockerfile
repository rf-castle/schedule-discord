FROM amd64/node:16.15.0-buster as bulider
WORKDIR /opt
COPY . .
RUN npm i && npm run build

FROM node:16.15.0-buster-slim
WORKDIR /opt
COPY package.json package-lock.json ./
RUN npm i --production
COPY --from=bulider /opt/out /opt/out
CMD ["node", "out/index.js"]

