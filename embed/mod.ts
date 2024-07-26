import { Embeds } from "jsr:@smallweb/embed@0.0.15/embed";

const embeds = new Embeds({
  "assets/index-BGRhmqHR.css": () => import("./assets/_index-BGRhmqHR.css.ts"),
  "assets/index-Dpg7Uohv.js": () => import("./assets/_index-Dpg7Uohv.js.ts"),
  "index.html": () => import("./_index.html.ts"),
  "vite.svg": () => import("./_vite.svg.ts"),
});

export default embeds;