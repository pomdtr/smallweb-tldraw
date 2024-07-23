import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const app = new Hono();

app.get(
    "*",
    serveStatic({ root: "./dist" }),
);

export default app;
