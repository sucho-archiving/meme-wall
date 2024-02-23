import fs from "fs";
import log from "loglevel";
import rss from "@astrojs/rss";
import { memes } from "../dataset.mjs";

const generateDescription = (meme) => {
  // "A synopsis of your item when you are publishing the full content
  //  of the item in the content field.The description may alternatively
  //  be the full content of the item in the feed if you are not using
  //  the content field (entity-coded HTML is permitted)."
  return `${meme.title}<br><br>${meme.textTranslatedIntoEnglish}`;
};

const generateEnclosure = async (meme) => {
  // `meme.imgUrl` is the absolute URL for the largest generated image
  const imageFn = meme.imgUrl.split("/").at(-1);
  let length = 0;

  // Read the image from the Astro assets cache, and get the filesize
  let imgInfo = fs.statSync(`node_modules/.astro/assets/${imageFn}`);
  length = imgInfo.size;

  return {
    url: meme.imgUrl,
    length: length,
    type: "image/webp",
  };
};

const getItems = async (memes) => {
  const items = [];
  for (let i = 0; i < memes.length; i++) {
    if (i % 100 === 0) log.debug(`     ${i} / ${memes.length}`);
    const meme = memes[i];
    items.push({
      title: meme.title,
      link: `/#${meme.driveId}`,
      pubDate: new Date(meme.timestamp),
      description: generateDescription(meme),
      // categories: [],
      enclosure: await generateEnclosure(meme),
    });
  }
  return items;
};

export async function GET(context) {
  const start = performance.now();
  log.info(" --> Generating items for RSS feed...");

  let items;
  try {
    items = await getItems(memes);
  } catch (error) {
    if (error.code == "ENOENT") {
      log.warn("     ... image assets not available -- aborting!");
      return new Response("Not found", { status: 404 });
    }
    log.error(error);
  }

  log.info(
    `     ... completed in ${(performance.now() - start).toFixed(0)}ms.`,
  );

  return rss({
    title: "SUCHO Meme Wall",
    description:
      "Collected memes from the SUCHO project concerning the Russian invasion of Ukraine.",
    site: context.site,
    items: items,
    // customData: `<language>en-us</language>`,
    trailingSlash: false,
  });
}
