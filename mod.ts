import { Command } from "@cliffy/command";
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

type TldrawParams = {
    outDir: string;
    basePath?: string;
};

export class Tldraw {
    constructor(public params: TldrawParams) { }

    fetch = (req: Request): Response | Promise<Response> => {
        const app = new Hono();
        if (this.params.basePath) {
            app.basePath(this.params.basePath);
        }

        app.get("/", async (c) => {
            await ensureDir(this.params.outDir);
            const files = await Array.fromAsync(Deno.readDir(this.params.outDir));
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
            await ensureDir(this.params.outDir);
            const entries = await Array.fromAsync(
                Deno.readDir(this.params.outDir),
            );
            return c.json(entries.map((entry) => ({
                key: basename(entry.name, ".json"),
                url: `/edit/${basename(entry.name, ".json")}`,
            })));
        });

        app.get("/edit/:name", async (c) => {
            const contentType = c.req.header("content-type");
            switch (contentType) {
                case "application/json": {
                    const filename = `${this.params.outDir}/${c.req.param("name")
                        }.json`;
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

        app.get("/view/:name", async (c) => {
            const output = c.req.query("output") || "json";
            if (output === "json") {
                const filename = `${this.params.outDir}/${c.req.param("name")
                    }.json`;
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

            return new Response("Unsupported output: " + output, {
                status: 400,
            });
        });

        app.post("/edit/:name", async (c) => {
            const drawing = await c.req.text();
            await ensureDir(this.params.outDir);
            await Deno.writeTextFile(
                `${this.params.outDir}/${c.req.param("name")}.json`,
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

        return app.fetch(req);
    };

    run = async (args: string[]): Promise<void> => {
        const name = basename(Deno.cwd());
        const command = new Command().name(name).action(() => {
            command.showHelp();
        });

        command.command("list").alias("ls").description("List all drawings")
            .action(
                async () => {
                    const entries = await Array.fromAsync(
                        Deno.readDir(this.params.outDir),
                    );

                    for (const entry of entries) {
                        console.log(entry.name);
                    }
                },
            );

        await command.parse(args);
    };
}

export default new Tldraw({
    outDir: "./drawings",
}) as Tldraw;
