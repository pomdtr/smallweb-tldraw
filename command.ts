import { Command } from "@cliffy/command";
import open from "open";
import type { Storage } from "@smallweb/storage";

export function createCommand({ storage }: { storage: Storage }): Command {
    const { hostname: name } = new URL(window.location.href);

    const root = new Command().name(name).action(() => {
        root.showHelp();
    });

    root.command("list").alias("ls").description("list drawings").action(
        async () => {
            const keys = await Array.fromAsync(storage.list());
            if (keys.length == 0) {
                console.log("no drawings");
                return;
            }

            console.log(keys.join("\n"));
        },
    );

    root.command("clear").description("clear all drawings").action(
        async () => {
            await storage.clear();
            console.log("cleared all drawings");
        },
    );

    root.command("open").description("open a drawing").arguments(
        "<drawing:string>",
    )
        .action(async (_, drawing) => {
            const url = new URL(`/edit/${drawing}`, window.location.href)
                .toString();
            await open(url);
        });

    return root;
}
