import { createObjectCsvStringifier } from "csv-writer";

import { memes } from "../dataset.mjs";

const memesRows = [...memes]
  // Sort earliest first for CSV output
  .sort((a, b) => a.timestamp - b.timestamp)
  // Map timestamps to a more manageable format
  .map((meme) => ({
    ...meme,
    timestamp: new Date(meme.timestamp).toISOString(),
  }));

const csvStringifier = createObjectCsvStringifier({
  header: [
    { id: "timestamp", title: "Timestamp" },
    { id: "datePosted", title: "Date Posted" },
    { id: "title", title: "Title" },
    { id: "url", title: "Source Url" },
    { id: "textTranslatedIntoEnglish", title: "Translated Title" },
    { id: "memeContentType", title: "Meme Content Type" },
    { id: "country", title: "Country" },
    { id: "language", title: "Language" },
    { id: "memeTemplateType", title: "Meme Template Type" },
    { id: "peopleIndividuals", title: "People" },
    { id: "memeFileName", title: "Original Filename" },
    { id: "uploadFile", title: "Google Drive Link" },
  ],
});

const csv =
  "\ufeff" + // Write a BOM at the start of the output to force Windows systems to recognize the file as UTF-8
  csvStringifier.getHeaderString() +
  csvStringifier.stringifyRecords(memesRows);

export async function get() {
  return {
    body: csv,
  };
}
