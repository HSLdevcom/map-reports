FROM node:10-alpine

ARG API_URL=http://localhost:4000
ENV API_URL=$API_URL

ENV WORK /opt/reporter

# Create app directory
RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

# Bundle app source
COPY . ${WORK}
RUN yarn build

EXPOSE 4000 1234

CMD \
  node_modules/.bin/nodemon --exec "yarn run server" & \
  node_modules/.bin/nodemon --exec "yarn run serve-ui"
