import fs from "fs";
import path from "path";
import log from "loglevel";

import { fetchDocument } from "./fetch-data.mjs";
import {
  contentTypeGlossaryDocId,
  peopleGlossaryDocId,
  templateTypeGlossaryDocId,
  cacheDir,
} from "./config.mjs";
import { parseGlossaryDoc } from "./parse-glossary-docs.mjs";

const SKIP_FETCH = process.env.SKIP_FETCH;
const cachePath = path.join(cacheDir, "glossary.json");

const loadCache = () => {
  if (!fs.existsSync(cachePath)) {
    throw new Error(
      `No cache found at ${cachePath}. Run without SKIP_FETCH first to generate it.`
    );
  }
  log.info(` --> Loading cached glossary from ${cachePath}...`);
  return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
};

const saveCache = (data) => {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  log.info(` --> Saved glossary cache to ${cachePath}`);
};

let contentTypeGlossary, peopleGlossary, templateTypeGlossary;

if (SKIP_FETCH) {
  const cached = loadCache();
  contentTypeGlossary = cached.contentTypeGlossary;
  peopleGlossary = cached.peopleGlossary;
  templateTypeGlossary = cached.templateTypeGlossary;
} else {
  let start = performance.now();
  log.info(" --> Fetching and parsing data from Google Docs...");

  const contentTypeHtml = await fetchDocument(contentTypeGlossaryDocId);
  contentTypeGlossary = parseGlossaryDoc(contentTypeHtml);

  const peopleHtml = await fetchDocument(peopleGlossaryDocId);
  peopleGlossary = parseGlossaryDoc(peopleHtml);

  const templateTypeHtml = await fetchDocument(templateTypeGlossaryDocId);
  templateTypeGlossary = parseGlossaryDoc(templateTypeHtml);

  log.info(`     ... completed in ${(performance.now() - start).toFixed(0)}ms.`);

  saveCache({
    contentTypeGlossary,
    peopleGlossary,
    templateTypeGlossary,
  });
}

export const glossaries = {
  "content-types": {
    glossary: contentTypeGlossary,
    termsKey: "memeTypes",
    title: `Content Types Glossary`,
    description: `Content Types Glossary`,
  },
  people: {
    glossary: peopleGlossary,
    termsKey: "people",
    title: `People Glossary`,
    description: `People Glossary`,
  },
  "template-types": {
    glossary: templateTypeGlossary,
    termsKey: "templateTypes",
    title: `Template Types Glossary`,
    description: `Template Types Glossary`,
  },
};

export { contentTypeGlossary, peopleGlossary, templateTypeGlossary };
