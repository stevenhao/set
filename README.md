# Set Game Repository
[![DeepWiki](https://img.shields.io/badge/DeepWiki-stevenhao%2Fset-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/stevenhao/set)



This repository contains the code for a web-based implementation of the Set card game. It includes all necessary assets and scripts to deploy and run the game in a web environment. The live version of the game can be played at [set.stevenhao.com](http://set.stevenhao.com).
## Introduction

The Set card game is a real-time puzzle where players identify patterns among cards with different symbols, colors, and numbers. This repository hosts the code that runs a digital version of the game, allowing players to enjoy Set in a browser.

## Game Description

In this implementation of Set, players are presented with a grid of cards. Each card has a unique combination of symbols, shading patterns, and colors. The objective is to identify a "set" of three cards where each feature is either the same on all the cards or different on all the cards.

## File Structure

The repository's structure is as follows:

- `public/`: Contains the HTML, CSS, CoffeeScript, and JavaScript files necessary for the game's frontend.
  - `index.html`: The main entry point for the game.
  - `*.coffee`: CoffeeScript files that define game logic.
  - `*.js`: JavaScript files for additional functionality.
  - `*.css`: Style sheets for the game's appearance.
  - `*.png`, `*.ico`: Image assets used in the game.
- `README.md`: The file you are currently reading.
- `deploy.sh`: A script for deploying the game to a production environment.
- `dev.sh`: A script for deploying the game to a development environment.

## How to Play

To play the game, visit [set.stevenhao.com](http://set.stevenhao.com). The website will guide you through the process of starting a new game, and you can interact with the cards directly in your browser.

## How to Build

The game's frontend is built with CoffeeScript and JavaScript. If you want to make changes to the CoffeeScript files, you will need to compile them to JavaScript. This requires a CoffeeScript compiler, which can be installed and run as follows:

```sh
npm install -g coffee-script
coffee -c public/*.coffee
```

## How to Deploy

To deploy the game to your server, you can use the provided `deploy.sh` script, which requires `rsync`. Update the script with your server's details:

```sh
rsync -rv * your_username@your_server:set/
```

For development deployment, use the `dev.sh` script similarly.

## Development Tools and Requirements

For development, you will need:

- A CoffeeScript compiler for compiling `.coffee` files.
- A web server to serve the static files.
- `rsync` for deploying your changes.

## Credits and License

This game was originally created by [Steven Hao](http://stevenhao.com) and is currently maintained by the open-source community. The game and its source code are released under the MIT License.

Feel free to contribute to the repository, report issues, or fork it to create your own version.



