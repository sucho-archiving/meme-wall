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
  // The URL of the largest generated image
  //  (submitted source size and resolution, with the intrinsic size indicator removed)
  const image = meme.srcSets.webp.split(", ").at(-1).split(" ")[0];

  // Hack using the astro-imagetools internals to get the generated image
  //  as a buffer so we can get the size in bytes
  // (This is slow -- not sure if there's a better way)
  const store = globalThis.astroImageToolsStore;
  const imageObject = store.get(image);
  const buffer = await imageObject.image.clone().toBuffer();

  return {
    url: image.split(" ")[0],
    length: buffer.length,
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

export async function get(context) {
  const start = performance.now();
  log.info(
    " --> Generating items for RSS feed (this may take a while -- use LOG_LEVEL=DEBUG to follow progress)...",
  );
  const items = await getItems(memes);
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
