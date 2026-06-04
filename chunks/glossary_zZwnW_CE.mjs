import fs from 'fs';
import path from 'path';
import log from 'loglevel';
import { f as fetchDocument } from './fetch-data_DozaeoQh.mjs';
import { c as cacheDir, a as contentTypeGlossaryDocId, p as peopleGlossaryDocId, t as templateTypeGlossaryDocId } from './config_Bj2EZlPB.mjs';
import { JSDOM } from 'jsdom';

const normalizeText = (text) => text.trim().replace(/\s+/g, " ");

const sluggify = (text) => {
  return text
    .toLowerCase()
    .replace(/[“”"'‘’.,?()\[\]!]/g, "")
    .replace(/[\/]/g, "_")
    .replace(/\s/g, "-")
    .replace(/–/g, "-")
    .replace(/-+/g, "-");
};

const parseSection = (titleEl) => {
  const title = titleEl.textContent.trim();
  const content = [];
  const urls = [];
  const hashtags = [];

  let next = titleEl;
  while (next.nextElementSibling && next.nextElementSibling.tagName !== "H2") {
    const text = next.nextElementSibling.textContent.trim();
    next = next.nextElementSibling;
    if (text === "") continue;
    if (text.startsWith("#")) {
      hashtags.push(text);
    } else if (text.startsWith("http")) {
      urls.push(text);
    } else {
      content.push(normalizeText(text));
    }
  }
  return { title, content, urls, hashtags };
};

const parseGlossaryDoc = (html) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const contentTypeGlossary = Object.fromEntries(
    [...document.querySelectorAll("h2")]
      .filter((titleEl) => titleEl.textContent.trim() !== "")
      .map((titleEl) => parseSection(titleEl))
      .map((c) => [sluggify(c.title), c]),
  );

  return contentTypeGlossary;
};

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

const glossaries = {
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

export { contentTypeGlossary as c, glossaries as g, peopleGlossary as p, sluggify as s, templateTypeGlossary as t };
