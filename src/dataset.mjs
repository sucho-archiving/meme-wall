import path from "path";

import gm from "gm";
import sizeOf from "image-size";

import { memeMediaFolder } from "./config.mjs";
import {
  fetchMemes,
  fetchMetadataHierarchies,
  fetchFile,
  purgeFiles,
} from "./fetch-data.mjs";

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

// fetch minimally-parsed data from the spreadsheet(s)
let memes = await fetchMemes();
let metadataHierarchies = await fetchMetadataHierarchies();

// parse some of the metadata values and sort by date
memes = memes
  .map((meme) => ({
    ...meme,
    memeTypes: meme.memeContentType.split(", ").map((type) => type.trim()),
    people: meme.peopleIndividuals.split(", ").map((person) => person.trim()),
    templateTypes: meme.memeTemplateType.split(", ").map((type) => type.trim()),
    languages: meme.language.split(", ").map((language) => language.trim()),
    countries: meme.country.split(", ").map((country) => country.trim()),
    timestamp: new Date(meme.timestamp),
  }))
  .sort((a, b) => b.timestamp - a.timestamp);

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
  meme.thumbnail = await generate3x3Thumbnail(filepath);
  meme.aspectRatio = getAspectRatio(filepath);
}

// Prepare facets and facet counts
const memeTypes = [
  ...new Set(
    memes
      .map((meme) => meme.memeTypes)
      .flat()
      .filter((x) => x),
  ),
]
  .map((memeType) => ({
    value: memeType,
    count: memes.filter((meme) => meme.memeTypes.includes(memeType)).length,
    group:
      Object.entries(metadataHierarchies.memeTypes).find(([group, memeTypes]) =>
        memeTypes.includes(memeType),
      )?.[0] || "Other",
  }))
  .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

const people = [
  ...new Set(
    memes
      .map((meme) => meme.people)
      .flat()
      .filter((x) => x),
  ),
]
  .map((person) => ({
    value: person,
    count: memes.filter((meme) => meme.people.includes(person)).length,
  }))
  .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

const languages = [
  ...new Set(
    memes
      .map((meme) => meme.languages)
      .flat()
      .filter((x) => x),
  ),
]
  .map((language) => ({
    value: language,
    count: memes.filter((meme) => meme.languages.includes(language)).length,
  }))
  .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

const countries = [
  ...new Set(
    memes
      .map((meme) => meme.countries)
      .flat()
      .filter((x) => x),
  ),
]
  .map((country) => ({
    value: country,
    count: memes.filter((meme) => meme.countries.includes(country)).length,
  }))
  .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

const templateTypes = [
  ...new Set(
    memes
      .map((meme) => meme.templateTypes)
      .flat()
      .filter((x) => x && x !== "Other"),
  ),
]
  .map((templateType) => ({
    value: templateType,
    count: memes.filter((meme) => meme.templateTypes.includes(templateType))
      .length,
    group:
      Object.entries(metadataHierarchies.templateTypes).find(
        ([group, templateTypes]) => templateTypes.includes(templateType),
      )?.[0] || "Other",
  }))
  .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

const groupOrders = Object.fromEntries(
  Object.entries(metadataHierarchies).map(([key, value]) => [
    key,
    Object.keys(value),
  ]),
);

export {
  memes,
  memeTypes,
  people,
  languages,
  countries,
  templateTypes,
  groupOrders,
};

// If called as a node script, print memes to stdout.
// See `yarn print-dataset`  (requires node >= v17.5.0)
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) {
  switch (process.argv[2]) {
    case "memeTypes":
      console.log(memeTypes);
      break;

    case "people":
      console.log(people);
      break;

    case "countries":
      console.log(countries);
      break;

    case "templateTypes":
      console.log(templateTypes);
      break;

    case "languages":
      console.log(languages);
      break;

    default:
      console.log(JSON.stringify(memes, null, 2));
  }
}
