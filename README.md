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

Run all services:

```sh
docker compose up --build
```

Stop services:

```sh
docker compose down
```

Connect to the DB from terminal:

```sh
docker exec -it my_db_container_name psql -U username database
\dt #list tables
```
