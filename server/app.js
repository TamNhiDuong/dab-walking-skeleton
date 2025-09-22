import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import { Redis } from "ioredis";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

const redis = new Redis(6379, "redis");

app.use("/*", cors());
app.use("/*", logger());
// Verify the server replicas (horizontal scaling)
const REPLICA_ID = crypto.randomUUID();

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

export default app;