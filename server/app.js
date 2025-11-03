import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import { Redis } from "ioredis";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

const redisProducer = new Redis(6379, "redis");

app.use("/*", cors());
app.use("/*", logger());
// Verify the server replicas (horizontal scaling)
const REPLICA_ID = crypto.randomUUID();
const QUEUE_NAME = "users";

app.use("*", async (c, next) => {
    c.res.headers.set("X-Replica-Id", REPLICA_ID);
    await next();
});

app.get("/", (c) => c.json({ message: "Hello world!" }));
app.get("/todos", async (c) => {
    const todos = await sql`SELECT * FROM todos`;
    return c.json(todos);
});

// cache
app.get("/redis-test", async (c) => {
    let count = await redis.get("test");
    if (!count) {
        count = 0;
    } else {
        count = Number(count);
    }

    count++;

    await redis.set("test", count);
    return c.json({ count });
});

const redisCacheMiddleware = async (c, next) => {
    const cachedResponse = await redis.get(c.req.url);
    if (cachedResponse) {
        const res = JSON.parse(cachedResponse);
        return Response.json(res.json, res);
    }

    await next();

    if (!c.res.ok) {
        return;
    }

    const clonedResponse = c.res.clone();

    const res = {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: Object.fromEntries(clonedResponse.headers),
        json: await clonedResponse.json(),
    };

    await redis.set(c.req.url, JSON.stringify(res));
};

app.get(
    "/hello/*",
    redisCacheMiddleware,
);

app.get(
    "/hello/:name",
    async (c) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return c.json({ message: `Hello ${c.req.param("name")}!` });
    },
);

// Message queues with redis
// app.post("/users", async (c) => {
//     const { name } = await c.req.json();
//     const user = await sql`INSERT INTO users (name) VALUES (${name})`;
//     c.status(202);
//     return c.body("Accepted");
// });

// Separate consumer service
app.post("/users", async (c) => {
    const { name } = await c.req.json();
    await redisProducer.lpush(QUEUE_NAME, JSON.stringify({ name }));
    c.status(202);
    return c.body("Accepted");
});

// LGTM test
app.get("/api/lgtm-test", (c) => {
    console.log("Hello log collection :)");
    return c.json({ message: "Hello, world!" });
});

export default app;

