import fs from "fs";
import path from "path";
import { writeFile } from "fs";
import { promisify } from "util";

import log from "loglevel";
import neatCsv from "neat-csv";
import sharp from "sharp";

import {
  formResponsesSheetId,
  readyTabId,
  driveApiKey,
  memeMediaFolder,
  hierarchiesSheetId,
  hierarchiesTabIds,
} from "./config.mjs";

const toCamelCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.|$)/g, (m, chr) => chr.toUpperCase());

const writeFilePromise = promisify(writeFile);

const getDriveApiUrl = (id) =>
  `https://www.googleapis.com/drive/v3/files/${id}?key=${driveApiKey}&alt=media`;

const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDriveId = (url) => {
  // Files submitted via the Google Form get a URL of the form
  //  https://drive.google.com/open?id=<driveId>
  let driveId = url.match(/id=([^&]+)/)?.[1];

  // Those manually added to the spreadsheet get a URL of the form
  //  https://drive.google.com/file/d/<driveId>/view?usp=sharing
  if (!driveId) driveId = url.match(/file\/d\/([^&\/]+)/)?.[1];
  if (!driveId) log.warn("Unable to parse a driveId from", url);
  return driveId;
};

const downloadFile = async (url, outputPath, fileStem) =>
  await fetch(url)
    .then((response) => {
      if (response.ok) return response;
      console.dir(response);
      process.exit(1);
    })
    .then(async (response) => {
      const buffer = await response.arrayBuffer();

      const mimeType = response.headers.get("content-type");
      const extension = mimeType.split("/")[1];
      const filename = `${fileStem}.${extension}`;
      const destination = path.join(outputPath, filename);

      if (extension === "jpeg") {
        // calling sharp.rotate with no arguments will rotate the image according
        //  to the jpeg EXIF `Orientation` tag (if it exists), and then remove the
        //  tag.  Should be a noop otherwise.
        const rotatedBuffer = await sharp(Buffer.from(buffer))
          .rotate()
          .toBuffer();
        writeFilePromise(destination, rotatedBuffer);
      } else {
        writeFilePromise(destination, Buffer.from(buffer));
      }

      return filename;
    });

const memeExists = (fileStem, memeMediaFolder) => {
  const files = fs.readdirSync(memeMediaFolder);
  for (let filename of files) {
    if (path.parse(filename).name === fileStem) return filename;
  }
  return false;
};

const fetchSheet = async (sheetId, tabId) => {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${tabId}`;
  const response = await fetch(sheetUrl);
  return await neatCsv(await response.text(), {
    mapHeaders: ({ header, index }) => toCamelCase(header.trim()),
    mapValues: ({ header, index, value }) => value.trim(),
  });
};

const fetchMemes = async () => {
  const memes = await fetchSheet(formResponsesSheetId, readyTabId);
  return memes
    .filter((meme) => meme.timestamp) // filter out empty rows
    .map((meme) => ({
      ...meme,
      driveId: parseDriveId(meme.uploadFile),
    }))
    .filter((meme) => meme.driveId); // filter out rows where we can't derive a driveId
};

const fetchMetadataHierarchies = async () => {
  const hierarchies = {};
  for (const [metadataType, tabId] of Object.entries(hierarchiesTabIds)) {
    const data = await fetchSheet(hierarchiesSheetId, tabId);
    hierarchies[metadataType] = data.reduce(
      (acc, row) => ({
        ...acc,
        [row.category]: [...(acc[row.category] || []), row.value],
      }),
      {},
    );
  }
  return hierarchies;
};

const fetchFile = async (meme, memeMediaFolder, delay = 1000) => {
  const { driveId } = meme;
  let filename;

  if (typeof (filename = memeExists(driveId, memeMediaFolder)) === "string") {
    log.debug(`     ${driveId}: exists (skipping)`);
    return [filename, false];
  }

  log.info(`     ${driveId}: downloading...`);

  const url = getDriveApiUrl(driveId);
  filename = await downloadFile(url, memeMediaFolder, driveId);
  await timer(delay);
  return [filename, true];
};

const purgeFiles = (memes, memeMediaFolder) => {
  let purgedCount = 0;
  const files = fs.readdirSync(memeMediaFolder);
  const driveIds = memes.map((meme) => meme.driveId);
  for (let filename of files) {
    if (!driveIds.includes(path.parse(filename).name)) {
      log.info(`     purging ${filename}...`);
      fs.unlinkSync(path.join(memeMediaFolder, filename));
      purgedCount++;
    }
  }
  return purgedCount;
};

export { fetchMemes, fetchMetadataHierarchies, fetchFile, purgeFiles };

// If called as a node script, fetch and parse the spreadsheet and ensure the
//  media files cache is up to date.
// See `yarn update-media`  (requires node >= v17.5.0)
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) {
  const memes = await fetchMemes();
  for (const meme of memes) {
    meme.filename = await fetchFile(meme, memeMediaFolder);
  }
  purgeFiles(memes, memeMediaFolder);
}
