import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const server = new Hono();

server.get(
    "*",
    serveStatic({ root: "./dist" }),
);

export default server;
