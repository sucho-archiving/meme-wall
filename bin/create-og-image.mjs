import { spawn } from "child_process";

import { pEventIterator } from "p-event";
import { chromium } from "playwright";

const delay = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const astroServerProcess = spawn("pnpm", ["dev"]);
let astroServerUrl;

const asyncIterator = pEventIterator(astroServerProcess.stdout, "data");
for await (const chunk of asyncIterator) {
  // wait for the Astro dev server to be ready and to report its URL
  if (
    (astroServerUrl = chunk.toString().match(/http:\/\/[\w\d]+:\d+\//)?.[0])
  ) {
    break;
  }
}

if (!astroServerUrl) {
  throw new Error("Server exited without reporting a URL!");
}

console.log(` --> Spawned Astro server listening at ${astroServerUrl}`);

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
});

const page = await browser.newPage();
page.setDefaultTimeout(0);
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(astroServerUrl, { waitUntil: "networkidle" });

// `waitUntil: "networkidle"` seems to be inadequate
console.log(` --> Waiting for the page to render before capturing...`);
await delay(1000);

await page.screenshot({ path: `./assets/open-graph.jpeg` });

await browser.close();
astroServerProcess.kill();

// explicitly exiting the node script seems to be necessary to prevent hanging
//  in the GitHub Actions CD runner; unclear why, tbh.
process.exit(0);
