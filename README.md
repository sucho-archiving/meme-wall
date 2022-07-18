# SUCHO Meme Wall

![GitHub deployments](https://img.shields.io/github/deployments/sucho-archiving/meme-wall/github-pages?label=gh-pages)

<https://memes.sucho.org/>

![](src/img/opengraph_image.1200x630.jpeg)


## Dataset Generation

When `yarn dev` or `yarn build` is run, the build process will fetch and parse the latest data from the curated "Ready" tab on the submission sheet and synchronize the local media cache with the contents of the submissions folder on Google Drive.  The identifiers for the submission sheet and tab, etc. are found in [`src/config.mjs`](src/config.mjs).

Running `yarn update-media` will fetch and synchronize the media files and then exit, and `yarn print-dataset` will fetch and parse the data and media files and then output the parsed data to `stdout` (it can take arguments to output different parts of the parsed dataset -- see [`src/dataset.mjs`](src/dataset.mjs) for details).


## Development

1. `git clone` this repository


### Live-Updating Development Build

1. Run `yarn` to install dependencies.
1. Run `yarn dev` to start the development server and reflect your changes to the page as you save files.
1. Visit `http://localhost:3000/` in your browser.


### Static Build

1. Run `yarn build` to create a production build (the deployment url can be set in [`astro.config.mjs`](astro.config.mjs) but only matters for OpenGraph/Twitter metadata etc.).
2. Serve `dist/` using an http server.


### Deploy to GH Pages

1. Users with write permissions to this repository can run `yarn gh-deploy` from the project root to install dependencies, build the static assets, and update and push to the `gh-pages` branch.
