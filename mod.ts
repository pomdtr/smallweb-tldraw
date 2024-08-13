import { createServer } from "./server.ts";

type TldrawParams = {
    root: string;
};

interface App {
    fetch: (req: Request) => Response | Promise<Response>;
}

function createApp(
    { root }: TldrawParams,
): App {
    return {
        fetch: createServer({ root }),
    };
}

const app: App = createApp({
    root: "./drawings",
});

export { createApp, createServer };
export default app;
