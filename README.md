# Set Game Repository
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



