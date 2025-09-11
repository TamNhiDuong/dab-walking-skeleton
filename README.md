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
