const openGraph = new Proxy({"src":"/assets/open-graph.3jUuB1yQ.jpeg","width":1200,"height":630,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/meme-wall/meme-wall/assets/open-graph.jpeg";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages.add("/home/runner/work/meme-wall/meme-wall/assets/open-graph.jpeg");
							return target[name];
						}
					});

export { openGraph as default };
