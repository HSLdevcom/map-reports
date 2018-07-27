FROM node:10-alpine

ARG api_url="http://localhost:4000"
ENV API_URL=$api_url

ARG base_url=""
ENV BASE_URL=$base_url

ARG public_path="/"
ENV PUBLIC_PATH=$public_path

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
RUN yarn run build --public-url ${PUBLIC_PATH}

EXPOSE 4000 1234

CMD yarn run production
