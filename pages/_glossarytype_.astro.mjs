import { c as createAstro, d as createComponent, r as renderComponent, e as renderTemplate, m as maybeRenderHead, f as addAttribute } from '../chunks/astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_B3kRUcP6.mjs';
import { g as glossaries, s as sluggify } from '../chunks/glossary_zZwnW_CE.mjs';
import { m as memes } from '../chunks/dataset_C3x4c14j.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://memes.sucho.org/");
const getStaticPaths = () => Object.entries(glossaries).map(([glossaryType, glossary]) => ({
  params: { glossaryType },
  props: glossary
}));
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { glossary, termsKey, title, description } = Astro2.props;
  const directoryOrder = Object.keys(glossary).sort((a, b) => a.localeCompare(b));
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": title, "description": description, "noIndex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>${title}</h1> <ul> ${directoryOrder.map((termSlug) => renderTemplate`<li> <a${addAttribute(`${termSlug}/`, "href")}>${glossary[termSlug].title}</a> [
${memes.filter(
    (m) => m[termsKey].map((t) => sluggify(t)).includes(termSlug)
  ).length}
]
</li>`)} </ul> ` })}`;
}, "/home/runner/work/meme-wall/meme-wall/src/pages/[glossaryType]/index.astro", void 0);

const $$file = "/home/runner/work/meme-wall/meme-wall/src/pages/[glossaryType]/index.astro";
const $$url = "/[glossaryType]/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
