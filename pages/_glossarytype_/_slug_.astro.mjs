import { c as createAstro, d as createComponent, r as renderComponent, e as renderTemplate, m as maybeRenderHead, u as unescapeHTML, f as addAttribute } from '../../chunks/astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../../chunks/PageLayout_B3kRUcP6.mjs';
import { g as glossaries, s as sluggify } from '../../chunks/glossary_zZwnW_CE.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://memes.sucho.org/");
const getStaticPaths = () => {
  return Object.entries(glossaries).map(
    ([glossaryType, glossary]) => Object.keys(glossary.glossary).map((slug) => ({
      params: { glossaryType, slug },
      props: glossary
    }))
  ).flat();
};
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { glossaryType, slug } = Astro2.params;
  const { glossary, title: typeTitle } = Astro2.props;
  const { title, content, urls, hashtags } = glossary[slug];
  const directoryOrder = Object.keys(glossary).sort((a, b) => a.localeCompare(b));
  const prev = directoryOrder.indexOf(slug) > 0 ? directoryOrder[directoryOrder.indexOf(slug) - 1] : null;
  const next = directoryOrder.indexOf(slug) + 1 < directoryOrder.length ? directoryOrder[directoryOrder.indexOf(slug) + 1] : null;
  const description = `${typeTitle}: ${title}`;
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": title, "description": description, "noIndex": true, "backToTop": false, "data-astro-cid-cp2p7uwe": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="nav" data-astro-cid-cp2p7uwe> ${prev ? renderTemplate`<span data-astro-cid-cp2p7uwe>${unescapeHTML(`<a href="${"/"}${glossaryType}/${sluggify(prev)}/"><< ${glossary[prev].title}</a>`)}</span>` : null} ${next ? renderTemplate`<span data-astro-cid-cp2p7uwe>${unescapeHTML(`<a href="${"/"}${glossaryType}/${sluggify(next)}/">${glossary[next].title} >></a>`)}</span>` : null} </div> <h1 data-astro-cid-cp2p7uwe>${title}</h1> <p data-astro-cid-cp2p7uwe>${content}</p> ${urls.length ? renderTemplate`<ul class="links" data-astro-cid-cp2p7uwe> ${urls.map((url) => renderTemplate`<li data-astro-cid-cp2p7uwe> <a${addAttribute(url, "href")} data-astro-cid-cp2p7uwe>${url}</a> </li>`)} </ul>` : null}${hashtags.length ? renderTemplate`<ul data-astro-cid-cp2p7uwe> ${hashtags.map((hashtag) => renderTemplate`<li data-astro-cid-cp2p7uwe>${hashtag}</li>`)} </ul>` : null}` })}  `;
}, "/home/runner/work/meme-wall/meme-wall/src/pages/[glossaryType]/[slug].astro", void 0);
const $$file = "/home/runner/work/meme-wall/meme-wall/src/pages/[glossaryType]/[slug].astro";
const $$url = "/[glossaryType]/[slug]/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
