import { Embeds } from "jsr:@smallweb/embed@0.0.15/embed";

const embeds = new Embeds({
  "assets/index-BGRhmqHR.css": () => import("./assets/_index-BGRhmqHR.css.ts"),
  "assets/index-CW1sZXkG.js": () => import("./assets/_index-CW1sZXkG.js.ts"),
  "index.html": () => import("./_index.html.ts"),
  "vite.svg": () => import("./_vite.svg.ts"),
});

export default embeds;