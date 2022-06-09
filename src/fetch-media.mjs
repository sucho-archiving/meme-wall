import fs from "fs";
import path from "path";
import { writeFile } from "fs";
import { promisify } from "util";

import { driveApiKey } from "./config.mjs";

const writeFilePromise = promisify(writeFile);

const getDriveApiUrl = (id) =>
  `https://www.googleapis.com/drive/v3/files/${id}?key=${driveApiKey}&alt=media`;

const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const downloadFile = async (url, outputPath, fileStem) =>
  await fetch(url)
    .then((response) => {
      if (response.ok) return response;
      console.dir(response);
      process.exit(1);
    })
    .then(async (response) => {
      const mimeType = response.headers.get("content-type");
      const buffer = await response.arrayBuffer();
      const filename = `${fileStem}.${mimeType.split("/")[1]}`;
      const destination = path.join(outputPath, filename);
      writeFilePromise(destination, Buffer.from(buffer));
      return filename;
    });

const memeExists = (fileStem, memeMediaFolder) => {
  const files = fs.readdirSync(memeMediaFolder);
  for (let filename of files) {
    if (path.parse(filename).name === fileStem) return filename;
  }
  return false;
};

export const fetchFile = async (meme, memeMediaFolder, delay = 1000) => {
  const { driveId } = meme;
  let filename;

  if (typeof (filename = memeExists(driveId, memeMediaFolder)) === "string") {
    console.log(`${driveId}: exists (skipping)`);
    return filename;
  }

  console.log(`${driveId}: downloading...`);

  const url = getDriveApiUrl(driveId);
  filename = await downloadFile(url, memeMediaFolder, driveId);
  await timer(delay);
  return filename;
};
