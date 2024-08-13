import { Hono } from "@hono/hono";
import embed from "./embed/mod.ts";
import { basename } from "@std/path";
import { ensureDir, exists } from "@std/fs";

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

export function createServer({ root }: {
    root: string;
}): (req: Request) => Response | Promise<Response> {
    const app = new Hono();

    app.get("/", async (c) => {
        await ensureDir(root);
        const files = await Array.fromAsync(Deno.readDir(root));
        if (files.length == 0) {
            return c.redirect("/create");
        }

        return c.redirect(
            `/edit/${encodeURIComponent(basename(files[0].name, ".json"))}`,
        );
    });

    app.get("/create", (c) => {
        const name = uniqueName();
        return c.redirect(`/edit/${name}`);
    });

    app.get("/list", async (c) => {
        await ensureDir(root);
        const entries = await Array.fromAsync(Deno.readDir(root));
        return c.json(entries.map((entry) => ({
            key: basename(entry.name, ".json"),
            url: `/edit/${basename(entry.name, ".json")}`,
        })));
    });

    app.get("/edit/:name", async (c) => {
        const contentType = c.req.header("content-type");
        switch (contentType) {
            case "application/json": {
                const filename = `${root}/${c.req.param("name")}.json`;
                if (!await exists(filename)) {
                    return new Response(null, {
                        status: 204,
                    });
                }
                const snapshot = await Deno.readTextFile(
                    filename,
                );

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
        const drawing = await c.req.text();
        await ensureDir(root);
        await Deno.writeTextFile(
            `${root}/${c.req.param("name")}.json`,
            drawing,
        );
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

    return (req) => app.fetch(req);
}
