# SUCHO Meme Wall


[![GitHub Pages Deployment Status](https://img.shields.io/github/deployments/sucho-archiving/meme-wall/github-pages?label=GitHub%20Pages)](https://github.com/sucho-archiving/meme-wall/actions/workflows/pages/pages-build-deployment) [![Update Media Workflow Status](https://img.shields.io/github/actions/workflow/status/sucho-archiving/meme-wall/update-media-and-deploy-site.yml?branch=main&label=Update%20Media)](https://github.com/sucho-archiving/meme-wall/actions/workflows/update-media-and-deploy-site.yml)


[![Visit the Meme Wall](https://raw.githubusercontent.com/sucho-archiving/meme-wall/gh-pages/open-graph.jpeg)](https://memes.sucho.org/)

[![Submit a Meme](https://img.shields.io/badge/Submit%20a%20Meme-blue?style=for-the-badge)](https://docs.google.com/forms/d/e/1FAIpQLSdhi-nky_fICuBD-HKaGsQi_ezukKtU3oVeMulMg0Ra8TCnvw/viewform)


## About the Meme Wall

The Meme Wall is built directly from submissions to [a Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdhi-nky_fICuBD-HKaGsQi_ezukKtU3oVeMulMg0Ra8TCnvw/viewform).  Contributors complete the form with details about a meme they have identified and attach an image or other media file to the form submission.  Form submissions are recorded in a Google Spreadsheet and submitted files are uploaded to a Google Drive folder.  Submissions are checked and curated by SUCHO volunteers.

The codebase in this repository uses the [Astro static site builder](https://astro.build/) to build the site and the required assets from the curated submissions on a daily basis.


## Dataset and Asset Generation

When `pnpm dev` or `pnpm build` is run, the build process will fetch and parse the latest data from the curated "Ready" tab on the submission sheet and synchronize the local media cache with the contents of the submissions folder on Google Drive.  Additional material for the glossaries is fetched and parsed from a number of Google Docs.  The identifiers for the sheets and docs etc. (which need to be publicly viewable), are found in [`src/config.mjs`](src/config.mjs).

Running `pnpm update-media` will fetch and synchronize the media files and then exit, and `pnpm print-dataset` will fetch and parse the data and media files and then output the parsed data to `stdout` (it can take arguments to output different parts of the parsed dataset -- see [`src/dataset.mjs`](src/dataset.mjs) for details).


## Development

1. `git clone` this repository


### Live-Updating Development Build

1. Run `pnpm install` to install dependencies.
1. Run `pnpm dev` to start the development server and reflect your changes to the page as you save files.
1. Visit `http://localhost:3000/` in your browser.


### Static Build

1. Run `pnpm build` to create a production build (the deployment url can be set in [`astro.config.mjs`](astro.config.mjs) but only matters for OpenGraph/Twitter metadata etc.).
2. Run `pnpm preview` to serve the contents of `dist/` using an http server at `http://localhost:3000/`.


### Deploy to GH Pages

1. Users with write permissions to this repository can run `pnpm gh-deploy` from the project root to install dependencies, build the static assets, and update and push to the `gh-pages` branch.  
  **Note:** the GitHub Actions workflow at [`.github/workflows/update-media-and-deploy-site.yml`](.github/workflows/update-media-and-deploy-site.yml) runs once a day and will automatically acquire new media, update the repository, and build and deploy the site as appropriate -- manual deploys should not generally be required.


### Additional Development Commands

* `pnpm update-media` (requires `node >= v18`) will fetch the spreadsheet, update the local working tree with any new (or missing) media files fetched from Google Drive, and delete any media files from `meme_media/` that do not correspond to records in the spreadsheet.
* `pnpm print-dataset` (requires `node >= v18`) will fetch the spreadsheet, process the data and media files, and then output the parsed dataset to `stdout` in JSON format.

* All `pnpm` commands can be prepended with `LOG_LEVEL=DEBUG` for additional debugging information on the console.
