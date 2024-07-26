import { Hono } from "@hono/hono";
import embed from "./embed/mod.ts";

export class Tldraw {
    public app: Hono;
    constructor() {
        this.app = new Hono();

        this.app.get("/api/load", () => {
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

        this.app.post("/api/save", async (c) => {
            const drawing = await c.req.text();
            localStorage.setItem("snapshot", drawing);
            return new Response(null, {
                status: 204,
            });
        });

        this.app.get(
            "*",
            (c) => {
                return embed.serve(c.req.raw);
            },
        );
    }

    fetch = (req: Request): Response | Promise<Response> => {
        return this.app.fetch(req);
    };
}
