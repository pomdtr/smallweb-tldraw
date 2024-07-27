import { Hono } from "@hono/hono";
import embed from "./embed/mod.ts";
import type { SmallwebStorage } from "@smallweb/storage";
import { LocalStorage } from "@smallweb/storage/local-storage";

type TldrawOptions = {
    storage?: SmallwebStorage;
};

export function tldraw(
    options: TldrawOptions = {},
): (req: Request) => Response | Promise<Response> {
    const storage: SmallwebStorage = options.storage || new LocalStorage();
    const app = new Hono();

    app.get("/api/load", async () => {
        try {
            const snapshot = await storage.get("snapshot");
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
        } catch (e) {
            await storage.delete("snapshot");
            return new Response(null, {
                status: 204,
            });
        }
    });

    app.post("/api/save", async (c) => {
        const drawing = await c.req.arrayBuffer();
        await storage.set("snapshot", new Uint8Array(drawing));
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

    return (req: Request) => app.fetch(req);
}
