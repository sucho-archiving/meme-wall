# SUCHO Meme Wall


[![GitHub Pages Deployment Status](https://img.shields.io/github/deployments/sucho-archiving/meme-wall/github-pages?label=GitHub%20Pages)](https://github.com/sucho-archiving/meme-wall/actions/workflows/pages/pages-build-deployment) [![Update Media Workflow Status](https://img.shields.io/github/workflow/status/sucho-archiving/meme-wall/Update%20Media?label=Update%20Media)](https://github.com/sucho-archiving/meme-wall/actions/workflows/update-media.yml)


[![Visit the Meme Wall](src/img/opengraph_image.1200x630.jpeg)](https://memes.sucho.org/)

[![Submit a Meme](https://img.shields.io/badge/Submit%20a%20Meme-blue?style=for-the-badge)](https://docs.google.com/forms/d/e/1FAIpQLSdhi-nky_fICuBD-HKaGsQi_ezukKtU3oVeMulMg0Ra8TCnvw/viewform)


## About the Meme Wall

The Meme Wall is built directly from submissions to [a Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdhi-nky_fICuBD-HKaGsQi_ezukKtU3oVeMulMg0Ra8TCnvw/viewform).  Contributors complete the form with details about a meme they have identified and attach an image or other media file to the form submission.  Form submissions are recorded in a Google Spreadsheet and submitted files are uploaded to a Google Drive folder.  Submissions are checked and curated by SUCHO volunteers.

The codebase in this repository uses the [Astro static site builder](https://astro.build/) to build the site and the required assets from the curated submissions on a daily basis.


## Dataset and Asset Generation

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
