import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

const app = new Hono();

app.get("/api/load", () => {
    const snapshot = localStorage.getItem("snapshot");
    if (!snapshot) {
        return new Response(null, {
            status: 204,
        });
    }

    return new Response(snapshot, {
        headers: {
            "Content-Type": "application/json",
        },
    });
});

app.post("/api/save", async (c) => {
    const drawing = await c.req.text();
    localStorage.setItem("snapshot", drawing);
    return new Response(null, {
        status: 204,
    });
});

app.get(
    "*",
    serveStatic({ root: "./static" }),
);

export default app;
