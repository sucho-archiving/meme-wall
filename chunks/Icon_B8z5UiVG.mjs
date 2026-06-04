import { c as createAstro, d as createComponent, f as addAttribute, e as renderTemplate, h as renderHead, m as maybeRenderHead, r as renderComponent, s as spreadAttributes, u as unescapeHTML } from './astro/server_Ba64zHfB.mjs';
import 'kleur/colors';
import 'clsx';
import { execSync } from 'node:child_process';
import '@astrojs/internal-helpers/path';
import { $ as $$Image } from './config_Bj2EZlPB.mjs';
/* empty css                         */

const $$Astro$2 = createAstro("https://memes.sucho.org/");
const $$Head = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Head;
  let openGraphImage = "";
  try {
    ({ default: openGraphImage } = await import('./open-graph_CF1A_oJH.mjs'));
  } catch (err) {
    {
      throw err;
    }
  }
  const commit = execSync("git rev-parse --short HEAD").toString().trim();
  const datetime = (/* @__PURE__ */ new Date()).toISOString();
  let { title, description, noIndex = false } = Astro2.props;
  return renderTemplate`<head prefix="dcterms: http://purl.org/dc/terms/#"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=5.0, minimum-scale=0.86"><!-- HTML Meta Tags --><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${noIndex && renderTemplate`<meta name="robots" content="noindex,nofollow">`}<!-- Facebook Meta Tags --><meta property="og:url"${addAttribute(Astro2.site, "content")}><meta property="og:type" content="website"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(openGraphImage, "content")}><!-- Twitter Meta Tags --><meta name="twitter:card" content="summary_large_image"><meta property="twitter:domain"${addAttribute(Astro2.site.host, "content")}><meta property="twitter:url"${addAttribute(Astro2.site, "content")}><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(openGraphImage, "content")}><meta name="version"${addAttribute(commit, "content")}><meta name="dcterms.modified"${addAttribute(datetime, "content")}>${renderHead()}</head>`;
}, "/home/runner/work/meme-wall/meme-wall/src/components/Head.astro", void 0);

const suchoLogo = new Proxy({"src":"/assets/sucho-logo.32x32.fH7kVuz7.png","width":32,"height":32,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/meme-wall/meme-wall/src/img/sucho-logo.32x32.png";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("/home/runner/work/meme-wall/meme-wall/src/img/sucho-logo.32x32.png");
							return target[name];
						}
					});

const $$Astro$1 = createAstro("https://memes.sucho.org/");
const $$Ident = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Ident;
  return renderTemplate`${maybeRenderHead()}<h1 data-astro-cid-wnyx4vro> ${renderComponent($$result, "Image", $$Image, { "src": suchoLogo, "width": 32, "densities": [2], "alt": "SUCHO", "data-astro-cid-wnyx4vro": true })} <a${addAttribute(Astro2.site.pathname, "href")} title="SUCHO Meme Wall" data-astro-cid-wnyx4vro>SUCHO Meme Wall</a> </h1> `;
}, "/home/runner/work/meme-wall/meme-wall/src/components/Ident.astro", void 0);

const $$Astro = createAstro("https://memes.sucho.org/");
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Icon;
  const { name, customAttribs = {}, className } = Astro2.props;
  const defaultAttribs = {
    viewBox: "0 0 24 24",
    "stroke-width": 1,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };
  const icons = {
    shuffle: {
      svg: `
      <path d="M18 4l3 3l-3 3"></path>
      <path d="M18 20l3 -3l-3 -3"></path>
      <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"></path>
      <path d="M21 7h-5a4.978 4.978 0 0 0 -2.998 .998m-4.002 8.003a4.984 4.984 0 0 1 -3 .999h-3"></path>
    `
    },
    search: {
      svg: `
      <circle cx="10" cy="10" r="7"></circle>
      <line x1="21" y1="21" x2="15" y2="15"></line>
    `
    },
    filter: {
      svg: `<path d="M5.5 5h13a1 1 0 0 1 .5 1.5l-5 5.5l0 7l-4 -3l0 -4l-5 -5.5a1 1 0 0 1 .5 -1.5"></path>`
    },
    "info-circle": {
      // substantially modified
      svg: `
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="8" stroke-width="1.5" />
      <line x1="12" y1="11" x2="12" y2="16" stroke-width="1.5" />
    `
    },
    "arrow-narrow-left": {
      svg: `
      <path d="M5 12l14 0"></path>
      <path d="M5 12l4 4"></path>
      <path d="M5 12l4 -4"></path>
    `
    },
    "arrow-narrow-right": {
      svg: `
      <path d="M5 12l14 0"></path>
      <path d="M15 16l4 -4"></path>
      <path d="M15 8l4 4"></path>
    `
    },
    upload: {
      svg: `
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
      <polyline points="7 9 12 4 17 9"></polyline>
      <line x1="12" y1="4" x2="12" y2="16"></line>
    `
    },
    reset: {
      svg: `
      <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1.002 7.935 1.007 9.425 4.747"></path>
      <path d="M20 4v5h-5"></path>
    `
    },
    share: {
      svg: `
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="6" r="3"></circle>
      <circle cx="18" cy="18" r="3"></circle>
      <line x1="8.7" y1="10.7" x2="15.3" y2="7.3"></line>
      <line x1="8.7" y1="13.3" x2="15.3" y2="16.7"></line>
    `
    },
    x: {
      svg: `
      <path d="M18 6l-12 12"></path>
      <path d="M6 6l12 12"></path>
    `
    }
  };
  if (!icons[name]) {
    throw new Error(`Icon ${name} not found`);
  }
  const { attribs = {}, svg } = icons[name];
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(customAttribs)}${spreadAttributes(attribs)}${spreadAttributes(defaultAttribs)}${addAttribute(className ? className : "", "class")} data-astro-cid-patnjmll>${unescapeHTML(svg)}</svg> `;
}, "/home/runner/work/meme-wall/meme-wall/src/components/Icon.astro", void 0);

export { $$Icon as $, $$Ident as a, $$Head as b };
