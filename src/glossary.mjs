import log from "loglevel";

import { fetchDocument } from "./fetch-data.mjs";
import { contentTypeGlossaryDocId } from "./config.mjs";
import { parseGlossaryDoc } from "./parse-glossary-docs.mjs";

let start = performance.now();
log.info(" --> Fetching and parsing data from Google Docs...");
const html = await fetchDocument(contentTypeGlossaryDocId);
export const contentTypeGlossary = parseGlossaryDoc(html);
log.info(`     ... completed in ${(performance.now() - start).toFixed(0)}ms.`);
