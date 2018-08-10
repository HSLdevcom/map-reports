# Map Reports

### Start a postgis database

```bash
docker run --name map-reports-postgis -e POSTGRES_PASSWORD=mysecretpassword -d mdillon/postgis
```

### Run in Docker

Build:

```bash
docker build -t hsldevcom/hsl-map-reports .
```

Run:

```bash
docker run -d -p 4000:4000 -p 1234:1234 hsldevcom/hsl-map-reports
```

You can also use the scripts `yarn run docker:build` and `yarn run docker:run`, which will have a higher likelihood of actually working.

Make sure to provide the build args API_URL and BASE_URL to the Docker build command.
API_URL will default to `http://localhost:4000` which should work in most cases,
and BASE_URL will default to an empty string.``
