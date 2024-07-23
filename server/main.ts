import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const server = new Hono();

server.get(
    "*",
    serveStatic({ root: "./static" }),
);

export default server;
