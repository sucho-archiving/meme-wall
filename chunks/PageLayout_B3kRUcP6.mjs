import { d as createComponent, e as renderTemplate, m as maybeRenderHead, c as createAstro, r as renderComponent, f as addAttribute, g as renderSlot } from './astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import { b as $$Head, a as $$Ident, $ as $$Icon } from './Icon_B8z5UiVG.mjs';
import 'clsx';
/* empty css                          */
/* empty css                          */

const version = "6";

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BackToTop = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", '<div id="scroll-to-top" data-astro-cid-wlspcwf4> <a href="#" aria-label="Scroll to Top" class="overlay-button" data-astro-cid-wlspcwf4> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1.5rem" width="1.5rem" stroke-width="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wlspcwf4> <line x1="12" y1="5" x2="12" y2="19" data-astro-cid-wlspcwf4></line> <line x1="18" y1="11" x2="12" y2="5" data-astro-cid-wlspcwf4></line> <line x1="6" y1="11" x2="12" y2="5" data-astro-cid-wlspcwf4></line> </svg> </a> </div> <script>\n  if (window.outerHeight > document.body.clientHeight)\n    document.getElementById("scroll-to-top").style.display = "none";\n<\/script> '])), maybeRenderHead());
}, "/home/runner/work/meme-wall/meme-wall/src/components/BackToTop.astro", void 0);

const $$Astro = createAstro("https://memes.sucho.org/");
const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageLayout;
  const { title, description, noIndex = false, backToTop = true } = Astro2.props;
  return renderTemplate`<html lang="en" data-astro-cid-porej7z2> ${renderComponent($$result, "Head", $$Head, { "title": title, "description": description, "noIndex": noIndex, "data-astro-cid-porej7z2": true })}${maybeRenderHead()}<body data-astro-cid-porej7z2> <header data-astro-cid-porej7z2> ${renderComponent($$result, "Ident", $$Ident, { "data-astro-cid-porej7z2": true })} <a class="button" title="Return to the Meme Wall"${addAttribute("/", "href")} data-astro-cid-porej7z2> ${renderComponent($$result, "Icon", $$Icon, { "name": "arrow-narrow-left", "data-astro-cid-porej7z2": true })} Return to the Meme Wall
</a> </header> <main data-astro-cid-porej7z2> ${renderSlot($$result, $$slots["default"])} </main> <footer data-astro-cid-porej7z2> <a${addAttribute(`https://github.com/sucho-archiving/meme-wall/releases/tag/v${version}`, "href")} target="gh-release"${addAttribute(`Release v${version} on GitHub`, "title")} data-astro-cid-porej7z2>v${version}</a> </footer> ${backToTop && renderTemplate`${renderComponent($$result, "BackToTop", $$BackToTop, { "data-astro-cid-porej7z2": true })}`}  </body> </html>`;
}, "/home/runner/work/meme-wall/meme-wall/src/components/PageLayout.astro", void 0);

export { $$PageLayout as $ };
