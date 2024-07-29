# Smallweb Tldraw

## Usage

Create a single `main.ts` file to get started.

```typescript
// ~/localhost/tldraw/main.ts
import { tldraw } from "jsr:@pomdtr/tldraw@0.0.3";

export default {
    fetch: tldraw(),
}
```

To create a new drawing, go to `/create`. You can list your drawings using `/list`.
