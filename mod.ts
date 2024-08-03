import { createCommand } from "./command.ts";
import { createServer } from "./server.ts";

import type { Storage } from "@smallweb/storage";
import { LocalStorage } from "@smallweb/storage/local-storage";

type TldrawParams = {
    storage: Storage;
};

interface App {
    fetch: (req: Request) => Response | Promise<Response>;
    run: (args: string[]) => void | Promise<void>;
}

function createApp(
    { storage }: TldrawParams,
): App {
    const server = createServer({ storage });
    const command = createCommand({ storage });

    return {
        fetch(req) {
            return server.fetch(req);
        },
        async run(args) {
            await command.parse(args);
        },
    };
}

const app: App = createApp({
    storage: new LocalStorage(),
});

export { createApp, createCommand, createServer };
export default app;
