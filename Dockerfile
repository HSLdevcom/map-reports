FROM node:10-alpine

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
RUN yarn run build

EXPOSE 1234

CMD yarn run production
