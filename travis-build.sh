#!/bin/bash
set -e

ORG=${ORG:-hsldevcom}
DOCKER_TAG=${TRAVIS_BUILD_NUMBER:-latest}
DOCKER_IMAGE=$ORG/hsl-map-reports:${DOCKER_TAG}
DOCKER_IMAGE_LATEST=$ORG/hsl-map-reports:latest

docker build -t $DOCKER_IMAGE --build-arg api_url=http://dev-kartat.hsldev.com/map-reports-api/ --build-arg base_url=/map-reports --build-arg public_path=/map-reports .

if [[ $TRAVIS_PULL_REQUEST == "false" ]] && [[ $TRAVIS_BRANCH == "master" ]]; then
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  docker push $DOCKER_IMAGE
  docker tag $DOCKER_IMAGE $DOCKER_IMAGE_LATEST
  docker push $DOCKER_IMAGE_LATEST
fi
