import neatCsv from "neat-csv";

const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1KUOXe5SMMaghl_JI_eZghHG18CXok3D6yb1_SHJM0no/export?format=csv";

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

const fetchSheet = async (sheetId) => {
  const response = await fetch(sheetUrl);
  return await neatCsv(await response.text(), {
    mapHeaders: ({ header, index }) => toCamelCase(header.trim()),
    mapValues: ({ header, index, value }) => value.trim(),
  });
};

const memes = await fetchSheet(sheetUrl);

export { memes };

// If called as a node script, print memes to stdout.
// See `yarn print-dataset`  (requires node >= v17.5.0)
import path from "path";
import { fileURLToPath } from "url";
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (nodePath === modulePath) console.log(JSON.stringify(memes, null, 2));
