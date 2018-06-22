The Raha mobile app. Implemented in React Native with TypeScript.

NOTE: These instructions are all written for Mac OSX at the moment.

## Setup

### System dependencies

`react-native` depends on some system programs being available. Follow [the
installation instructions at `react-native`'s website for "Building Projects
with Native
Code"](https://facebook.github.io/react-native/docs/getting-started.html), but
stop before the "Creating a new application" section (we already created one!).

### Node dependencies

Before you run the app, first ensure `yarn` is installed (we use that instead of
`npm` to manage the dependencies and scripts listed in `package.json`):

```bash
npm install -g yarn
```

Then, `cd` into this directory and install the dependencies of the project:

```bash
yarn install
```

### Configuration

Finally, copy over either the prod or test config, whichever environment you'd
like to develop in.

```bash
yarn config:prod
# OR
yarn config:test
```

## Running the app

To run it on an iPhone emulator, run `yarn start:ios`, and it an iPhone emulator
running the code should start.

On physical devices, refer to [the instructions
here](https://facebook.github.io/react-native/docs/running-on-device.html). You
will need a USb cable to connect your phone to your computer.

## Other scripts

```bash
yarn test  # run tests
```

## Development environment

I recommend [using VSCode](https://code.visualstudio.com/) to edit your code
because its tooling for TypeScript and React Native is solid. In particular, I
recommend navigating to the recommended extensions and installing them:

![Screenshot of Recommended Extensions pane in
VSCode](setup-instructions/recommended-extensions.png)

### Happy hacking!
