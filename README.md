Run the client:

```sh
docker compose run client deno install && docker compose build --no-cache && docker compos e up --remove-orphans
```

Run the server:

```sh
docker compose build server
docker compose up -d --build server
docker compose restart server
```

Run the k6 performance testing:

```sh
docker compose up --build
docker compose run --rm --entrypoint=k6 k6-tests run /tests/hello-k6.js
```

Stop services:

```sh
docker compose down
```
