import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const app = new Hono();

app.get("/api/hello", (c) => {
    return c.json({ message: "Hello, World!" });
});

app.get(
    "*",
    serveStatic({ root: "./static" }),
);

export default app;
