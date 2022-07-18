# SUCHO Meme Wall

![GitHub deployments](https://img.shields.io/github/deployments/sucho-archiving/meme-wall/github-pages?label=gh-pages)

<https://memes.sucho.org/>

![](src/img/opengraph_image.1200x630.jpeg)


## Development

1. `git clone` this repository


### Live-Updating Development Build

1. `yarn`.
1. `yarn dev` (This will run the development server and reflect your changes to the page as you save files).
1. Visit `http://localhost:3000` in your browser.


### Static Build

1. `yarn build` for a production build.
2. Serve `dist/` using an http server.


### Deploy to GH Pages

1. Users with write permissions to this repository can run `yarn gh-deploy` from the project root to install dependencies, build the static assets, and update and push to the `gh-pages` branch.
