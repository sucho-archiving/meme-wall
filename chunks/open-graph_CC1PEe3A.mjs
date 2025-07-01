const openGraph = new Proxy({"src":"/assets/open-graph.BoGtPl8Z.jpeg","width":1200,"height":630,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/simon/Projects/SUCHO/meme-wall/site/assets/open-graph.jpeg";
							}
							globalThis.astroAsset.referencedImages.add("/home/simon/Projects/SUCHO/meme-wall/site/assets/open-graph.jpeg");
							return target[name];
						}
					});

export { openGraph as default };
