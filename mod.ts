import { Hono } from "@hono/hono";
import embed from "./embed/mod.ts";

export class Tldraw {
    constructor() {}
    fetch = (req: Request): Response | Promise<Response> => {
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
            (c) => {
                return embed.serve(c.req.raw);
            },
        );

        return app.fetch(req);
    };
}
