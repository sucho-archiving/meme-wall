import { d as createComponent, r as renderComponent, e as renderTemplate, F as Fragment, m as maybeRenderHead } from '../chunks/astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_B3kRUcP6.mjs';
import { g as glossaries, s as sluggify } from '../chunks/glossary_zZwnW_CE.mjs';
import { m as memes } from '../chunks/dataset_C3x4c14j.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  const title = "Admin :: SUCHO Meme Wall";
  const description = "Admin Page";
  const getUnusedGlossaryEntries = (glossary, termsKey) => {
    const unusedEntries = Object.keys(glossary).filter(
      (termSlug) => memes.filter(
        (m) => m[termsKey].map((t) => sluggify(t)).includes(termSlug)
      ).length === 0
    );
    return unusedEntries.sort((a, b) => a.localeCompare(b));
  };
  const getMissingGlossaryEntries = (glossary, termsKey) => {
    const missingEntries = /* @__PURE__ */ new Set();
    memes.forEach((m) => {
      m[termsKey].forEach((t) => {
        if (t && !glossary[sluggify(t)]) {
          missingEntries.add(t);
        }
      });
    });
    return Array.from(missingEntries).sort((a, b) => a.localeCompare(b));
  };
  const sections = Object.values(glossaries).map(({ title: title2, glossary, termsKey }) => {
    const unused = getUnusedGlossaryEntries(glossary, termsKey);
    const missing = getMissingGlossaryEntries(glossary, termsKey);
    if (unused.length || missing.length) {
      return { title: title2, unused: unused.map((m) => glossary[m].title), missing };
    }
  }).filter((x) => x);
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": title, "description": description, "noIndex": true, "data-astro-cid-2zp6q64z": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-2zp6q64z": true }, { "default": ($$result3) => renderTemplate`${sections.map(({ title: title2, unused, missing }) => renderTemplate`${maybeRenderHead()}<section data-astro-cid-2zp6q64z> <h2 data-astro-cid-2zp6q64z>${title2}</h2> ${unused.length ? renderTemplate`<p data-astro-cid-2zp6q64z>
The following terms from the glossary are not represented in the
              memes dataset:
</p>
            <ul data-astro-cid-2zp6q64z> ${unused.map((m) => renderTemplate`<li data-astro-cid-2zp6q64z>${m}</li>`)} </ul>` : ""} ${missing.length ? renderTemplate`<p data-astro-cid-2zp6q64z>The following terms do not have glossary entries available:</p>
            <ul data-astro-cid-2zp6q64z> ${missing.map((m) => renderTemplate`<li data-astro-cid-2zp6q64z>${m}</li>`)} </ul>` : ""} </section>`)}${!sections.length && renderTemplate`<p data-astro-cid-2zp6q64z>
There are no terms in the glossary that are not represented in the
          memes dataset!
</p>`}` })} ` })} `;
}, "/home/runner/work/meme-wall/meme-wall/src/pages/admin.astro", void 0);

const $$file = "/home/runner/work/meme-wall/meme-wall/src/pages/admin.astro";
const $$url = "/admin/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
