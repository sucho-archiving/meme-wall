import fs from "fs";
import path from "path";

import sizeOf from "image-size";
import neatCsv from "neat-csv";

const sheetUrl =
  "https://docs.google.com/spreadsheets/d/12K7vdLa1PFFcuzQ5VWFxzhiJWp7wOqzhYWx-o9Atjps/export?format=csv";

const memeMediaFolder = "meme_media";

const toCamelCase = (str) =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

const getAspectRatio = (imgPath) => {
  const dimensions = sizeOf(imgPath);
  return dimensions.width / dimensions.height;
};

const fetchSheet = async (sheetId) => {
  const response = await fetch(sheetUrl);
  return await neatCsv(await response.text(), {
    mapHeaders: ({ header, index }) => toCamelCase(header.trim()),
    mapValues: ({ header, index, value }) => value.trim(),
  });
};

let memes = await fetchSheet(sheetUrl);

memes = memes
  .filter((meme) => meme.timestamp)
  .filter((meme) => meme.driveFilename)
  .filter((meme) => meme.driveFilename.match(/\.jpg|\.jpeg|\.png$/i))
  .map((meme) => ({
    ...meme,
    mediaPath: path.join(memeMediaFolder, meme.driveFilename),
  }))
  .filter((meme) => fs.existsSync(meme.mediaPath))
  .map((meme) => ({
    ...meme,
    mediaAspectRatio: getAspectRatio(meme.mediaPath),
    memeTypes: meme.memeContentType.split(", "),
  }))
  // FIXME: exclude filenames with non-ascii characters
  .filter((meme) => /^[\u0000-\u007f]*$/.test(meme.mediaPath));

const memeTypes = new Set(memes.map((meme) => meme.memeTypes).flat());

export { memes, memeTypes };

// If called as a node script, print memes to stdout.
// See `yarn print-dataset`  (requires node >= v17.5.0)
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) console.log(JSON.stringify(memes, null, 2));
if (nodePath === modulePath) console.log(memeTypes);
