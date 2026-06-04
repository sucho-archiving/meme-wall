import { c as createAstro, d as createComponent, m as maybeRenderHead, f as addAttribute, e as renderTemplate, r as renderComponent } from '../chunks/astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_B3kRUcP6.mjs';
import 'clsx';
import { d as datasetObj, m as memes } from '../chunks/dataset_C3x4c14j.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://memes.sucho.org/");
const $$StatsTable = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StatsTable;
  const { facet, description } = Astro2.props;
  const facetValues = datasetObj[facet];
  return renderTemplate`${maybeRenderHead()}<table${addAttribute(facet, "id")} data-astro-cid-dp5cgako> <caption data-astro-cid-dp5cgako>${description}</caption> <thead data-astro-cid-dp5cgako> <tr data-astro-cid-dp5cgako><th data-astro-cid-dp5cgako>Value</th><th data-astro-cid-dp5cgako>Count</th></tr> </thead> <tbody data-astro-cid-dp5cgako> ${Array.from(facetValues).map((option) => renderTemplate`<tr data-astro-cid-dp5cgako> <td data-astro-cid-dp5cgako>${option.value}</td> <td data-astro-cid-dp5cgako>${option.count}</td> </tr>`)} </tbody> </table> `;
}, "/home/runner/work/meme-wall/meme-wall/src/components/StatsTable.astro", void 0);

const $$Stats = createComponent(($$result, $$props, $$slots) => {
  const title = "Stats :: SUCHO Meme Wall";
  const description = "Collected memes from the SUCHO project concerning the Russian invasion of Ukraine.";
  const facets = [
    ["memeTypes", "Meme Types"],
    ["people", "People"],
    ["countries", "Countries"],
    ["templateTypes", "Template Types"],
    ["languages", "Languages"]
  ];
  const memeCount = memes.length;
  const mostRecentMeme = new Date(memes[0].timestamp).toISOString().slice(0, 10);
  const currentDay = new Date(memes[0].timestamp).getDate();
  const memesByDateAdded = memes.reduce(
    (result, meme) => ({
      ...result,
      [`${new Date(meme.timestamp).toISOString().slice(0, 7)}`]: [
        ...result[`${new Date(meme.timestamp).toISOString().slice(0, 7)}`] || [],
        meme
      ]
    }),
    {}
  );
  let size = 0;
  const chartData = Object.keys(memesByDateAdded).sort((a, b) => new Date(a) - new Date(b)).map((date, index, arr) => ({
    key: date,
    start: size,
    size: size += memesByDateAdded[date].length,
    width: (
      // for the last month, calculate width as a percentage of the month elapsed
      //  (assumes all months are 30 days long -- good enough for this purpose)
      index === arr.length - 1 && date === mostRecentMeme.slice(0, 7) ? currentDay / 30 * 100 : 100
    )
  }));
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": title, "description": description, "data-astro-cid-j3fvw3lo": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section data-astro-cid-j3fvw3lo> <header data-astro-cid-j3fvw3lo> <h2 data-astro-cid-j3fvw3lo>Statistics</h2> </header> <nav data-astro-cid-j3fvw3lo> ${facets.map(([facet, description2]) => renderTemplate`<a${addAttribute(`#${facet}`, "href")} data-astro-cid-j3fvw3lo>${description2}</a>`)} </nav> <table data-astro-cid-j3fvw3lo> <tbody data-astro-cid-j3fvw3lo> <tr data-astro-cid-j3fvw3lo><td data-astro-cid-j3fvw3lo>Total Memes:</td><td data-astro-cid-j3fvw3lo>${memeCount.toLocaleString()}</td></tr> <tr data-astro-cid-j3fvw3lo><td data-astro-cid-j3fvw3lo>Most Recent Updates:</td><td data-astro-cid-j3fvw3lo>${mostRecentMeme}</td></tr> </tbody> </table> <table${addAttribute([
    "charts-css",
    "line",
    "show-heading",
    "hide-data",
    "show-primary-axis",
    "show-labels",
    "show-data-axes",
    "show-data-on-hover"
  ], "class:list")} data-astro-cid-j3fvw3lo> <caption data-astro-cid-j3fvw3lo>Accumulation of Memes</caption> <thead data-astro-cid-j3fvw3lo><tr data-astro-cid-j3fvw3lo><th scope="col" data-astro-cid-j3fvw3lo>Month</th> <th scope="col" data-astro-cid-j3fvw3lo>Cumulative Total</th> </tr> </thead> <tbody data-astro-cid-j3fvw3lo> ${chartData.map((dataObj) => renderTemplate`<tr data-astro-cid-j3fvw3lo> ${dataObj.key && renderTemplate`<th scope="row" data-astro-cid-j3fvw3lo>${dataObj.key}</th>`} <td${addAttribute(`--start: ${dataObj.start / size}; --size: ${dataObj.size / size}; width: ${dataObj.width}%;`, "style")} data-astro-cid-j3fvw3lo> <span class="data" data-astro-cid-j3fvw3lo>${dataObj.size}</span> </td> </tr>`)} </tbody> </table> <div data-astro-cid-j3fvw3lo> ${facets.map(([facet, description2]) => renderTemplate`${renderComponent($$result2, "StatsTable", $$StatsTable, { "facet": facet, "description": description2, "data-astro-cid-j3fvw3lo": true })}`)} </div> </section> ` })} `;
}, "/home/runner/work/meme-wall/meme-wall/src/pages/stats.astro", void 0);

const $$file = "/home/runner/work/meme-wall/meme-wall/src/pages/stats.astro";
const $$url = "/stats/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Stats,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
