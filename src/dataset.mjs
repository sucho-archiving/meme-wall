import path from "path";

import gm from "gm";
import sizeOf from "image-size";
import neatCsv from "neat-csv";

import { fetchFile, purgeFiles } from "./fetch-media.mjs";

import {
  formResponsesSheetId,
  readyTabId,
  memeMediaFolder,
} from "./config.mjs";

const sheetUrl = `https://docs.google.com/spreadsheets/d/${formResponsesSheetId}/export?format=csv&gid=${readyTabId}`;

const toCamelCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.|$)/g, (m, chr) => chr.toUpperCase());

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

const fetchSheet = async (sheetUrl) => {
  const response = await fetch(sheetUrl);
  return await neatCsv(await response.text(), {
    mapHeaders: ({ header, index }) => toCamelCase(header.trim()),
    mapValues: ({ header, index, value }) => value.trim(),
  });
};

let memes = await fetchSheet(sheetUrl);

memes = memes
  .filter((meme) => meme.timestamp) // filter out empty rows
  .map((meme) => ({
    ...meme,
    driveId: meme.uploadFile.match(/id=([^&]+)/)?.[1],
  }))
  .filter((meme) => meme.driveId) // filter out rows where we can't derive a driveId
  .map((meme) => ({
    ...meme,
    memeTypes: meme.memeContentType.split(", ").map((type) => type.trim()),
    timestamp: new Date(meme.timestamp),
  }))
  .sort((a, b) => b.timestamp - a.timestamp);

for (const meme of memes) {
  meme.filename = await fetchFile(meme, memeMediaFolder);
}

purgeFiles(memes, memeMediaFolder);

// filter out non-image files
// note: may prove to be inadequate
memes = memes.filter((meme) =>
  meme.filename.match(/\.jpg|\.jpeg|\.png|\.webp$/i),
);

for (const meme of memes) {
  const filepath = path.join(memeMediaFolder, meme.filename);
  meme.thumbnail = await generate3x3Thumbnail(filepath);
  meme.aspectRatio = getAspectRatio(filepath);
}

const memeTypes = new Set(memes.map((meme) => meme.memeTypes).flat());

export { memes, memeTypes };

// If called as a node script, print memes to stdout.
// See `yarn build-dataset`  (requires node >= v17.5.0)
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) {
  switch (process.argv[2]) {
    case "memeTypes":
      console.log(memeTypes);
      break;

    default:
      console.log(JSON.stringify(memes, null, 2));
  }
}
