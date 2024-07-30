import { Hono } from "@hono/hono";
import embed from "./embed/mod.ts";
import type { SmallwebStorage } from "@smallweb/storage";

import { LocalStorage } from "@smallweb/storage/local-storage";
import {
    animals,
    colors,
    uniqueNamesGenerator,
} from "@joaomoreno/unique-names-generator";

function uniqueName() {
    return uniqueNamesGenerator({
        length: 2,
        style: "lowerCase",
        separator: "-",
        dictionaries: [colors, animals],
    }).replace(/^(\w)/, (str) => str.toLowerCase());
}

type TldrawOptions = {
    storage?: SmallwebStorage;
};

export function tldraw(
    options: TldrawOptions = {},
): (req: Request) => Response | Promise<Response> {
    const storage: SmallwebStorage = options.storage || new LocalStorage();
    const app = new Hono();

    app.get("/", async (c) => {
        const keys = await storage.keys();
        if (keys.length == 0) {
            return c.redirect("/create");
        }

        return c.redirect(`/edit/${encodeURIComponent(keys[0])}`);
    });

    app.get("/create", (c) => {
        const name = uniqueName();
        return c.redirect(`/edit/${name}`);
    });

    app.get("/list", async (c) => {
        const keys = await storage.keys();
        return c.json(keys.map((key) => ({
            key,
            url: `/edit/${key}`,
        })));
    });

    app.get("/edit/:name", async (c) => {
        const contentType = c.req.header("content-type");
        switch (contentType) {
            case "application/json": {
                const snapshot = await storage.getJson(c.req.param("name"));
                if (!snapshot) {
                    return new Response(null, {
                        status: 204,
                    });
                }

                return c.json(snapshot);
            }
            default: {
                const page = await embed.load("index.html");
                return new Response(await page.bytes(), {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }
        }
    });

    app.post("/edit/:name", async (c) => {
        const drawing = await c.req.json();
        await storage.setJson(c.req.param("name"), drawing);
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
