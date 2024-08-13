import { Embeds } from "jsr:@smallweb/embed@0.0.15/embed";

const embeds = new Embeds({
  "assets/index-BGRhmqHR.css": () => import("./assets/_index-BGRhmqHR.css.ts"),
  "assets/index-DusY3U_y.js": () => import("./assets/_index-DusY3U_y.js.ts"),
  "index.html": () => import("./_index.html.ts"),
  "vite.svg": () => import("./_vite.svg.ts"),
});

export default embeds;