# Build
FROM node:14.16.0-alpine3.13 as build

WORKDIR /usr/src/app
COPY . .

RUN npm install
RUN npm run build


# Production Environment
FROM node:14.16.0-alpine3.13

WORKDIR /usr/src/app

ENV NODE_ENV=production
COPY ./package.json ./package.json

COPY --from=build /usr/src/app/dist /usr/src/app/dist

CMD ["npm", "run", "start"]
