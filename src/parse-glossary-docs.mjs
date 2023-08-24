import { JSDOM } from "jsdom";

import { normalizeText, sluggify } from "./utils.js";

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

export const parseGlossaryDoc = (html) => {
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
