# Map Reports

### Run in Docker

Build:

```
docker build -t map-reports .
```

Run:

```
docker run -d -p 4000:4000 -p 1234:1234 map-reports
```

You can also use the scripts `yarn run docker:build` and `yarn run docker:run`, which will have a higher likelyhood of actually working.
