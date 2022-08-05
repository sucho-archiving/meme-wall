import path from "path";

import gm from "gm";
import sizeOf from "image-size";

import { memeMediaFolder } from "./config.mjs";
import { fetchMemes, fetchFile, purgeFiles } from "./fetch-data.mjs";

const getAspectRatio = (imgPath) => {
  const dimensions = sizeOf(imgPath);
  return dimensions.width / dimensions.height;
};

const generate3x3Thumbnail = (imgPath) => {
  return new Promise(async (resolve, reject) => {
    gm(imgPath)
      .resize(3, 3)
      .toBuffer("GIF", (error, buffer) => {
        resolve(`data:image/gif;base64,${buffer.toString("base64")}`);
      });
  });
};

// fetch minimally-parsed data from the spreadsheet
let memes = await fetchMemes();

// parse some of the metadata values and sort by date
memes = memes
  .map((meme) => ({
    ...meme,
    
	gender: meme.gender.split(", ").map((gender) => gender.trim()),
    id: meme.id.split(", ").map((id) => id.trim()),
    dateRange: meme.dateRange.split(", ").map((dateRange) => dateRange.trim()),
    yearListed: meme.yearListed.split(", ").map((yearListed) => yearListed.trim()),
    type: meme.type.split(", ").map((type) => type.trim()),
    pieces: meme.pieces.split(", ").map((pieces) => pieces.trim()),
  }))
  .sort((a, b) => b.dateRange - a.dateRange);

// ensure all media files are available locally
for (const meme of memes) {
  meme.filename = await fetchFile(meme, memeMediaFolder);
}

purgeFiles(memes, memeMediaFolder);

// filter out non-image files
// note: may prove to be inadequate (if other image types are submitted)
// note: must be done after files are fetched, as we don't know file types / extensions
//  until after they are downloaded
memes = memes.filter((meme) =>
  meme.filename.match(/\.jpg|\.jpeg|\.png|\.webp$/i),
);

// parse the images and generate thumbnails and aspect ratios
for (const meme of memes) {
  const filepath = path.join(memeMediaFolder, meme.filename);
  meme.thumbnail = ""
  meme.aspectRatio = getAspectRatio(filepath);
}

// Prepare facets and facet counts
const gender = new Set(
  memes
    .map((meme) => meme.gender)
    .flat()
    .filter((x) => x),
);
const id = new Set(
  memes
    .map((meme) => meme.id)
    .flat()
    .filter((x) => x),
);
const dateRange = new Set(
  memes
    .map((meme) => meme.dateRange)
    .flat()
    .filter((x) => x),
);
const yearListed = new Set(
  memes
    .map((meme) => meme.yearListed)
    .flat()
    .filter((x) => x),
);
const type = new Set(
  memes
    .map((meme) => meme.type)
    .flat()
    .filter((x) => x && x !== "Other"),
);

export { memes, gender, id, dateRange, yearListed, type };

// If called as a node script, print memes to stdout.
// See `yarn print-dataset`  (requires node >= v17.5.0)
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) {
  switch (process.argv[2]) {
    case "memeTypes":
      console.log(gender);
      break;

    case "people":
      console.log(id);
      break;

    case "countries":
      console.log(dateRange);
      break;

    case "templateTypes":
      console.log(yearListed);
      break;

    case "languages":
      console.log(type);
      break;

    default:
      console.log(JSON.stringify(memes, null, 2));
  }
}
