This project was bootstrapped with [Create React Native
App](https://github.com/react-community/create-react-native-app).

The original guide with more detailed setup and troubleshooting information [is
available
here](https://github.com/mathieudutour/create-react-native-app-typescript/blob/master/react-native-scripts/template/README.md).

## Setup

Before you run the app, first ensure `yarn` is installed (we use that instead of
`npm`):

```bash
npm install -g yarn
```

Then, install the dependencies of the project:

```bash
yarn install
```

Finally, copy over either the prod or test config, whichever environment you'd
like to develop in.

```bash
yarn config:prod
# OR
yarn config:test
```

## Running the app

To run it, run `yarn start` and follow the instructions provided. You can
immediately run the app on an emulator on your machine; on Mac, you can run it
in an iOS emulator easily; Android has a bit tougher setup (TODO: add some links
to docs about that).

If you have trouble running on an iOS emulator, check [troubleshooting
instructions
here](https://github.com/mathieudutour/create-react-native-app-typescript/blob/master/react-native-scripts/template/README.md#ios-simulator-wont-open).

### Running on a physical device

1.  On your device, install (the Expo app)[https://expo.io/tools#client].
1.  Get your device and dev machine on the same Wi-Fi (if they can't find each
    other, see the next section about public networks).
1.  Run `yarn start`.
1.  Scan the QR code or send your phone a link to run the app via the prompts on
    your dev machine.

#### Running on public networks

If you want to test it on a physical device but you're on a public network (no
peer-to-peer connections), `yarn start` won't work. Instead, do the following:

1.  Install the [Expo XDE app](https://github.com/expo/xde/releases), which will
    connect to your phone via a tunnel over the internet. You may need to make
    an account, which will push the URL to your phone automatically.
1.  Run Expo XDE on your dev machine. Ensure that the tunnel gets successfully
    created; you can tell if the URL bar has a url that isn't just an IP address
    or blank. For example, it might look like
    `exp://ab-cde.your_username.mobile.exp.direct:80`.
1.  On your mobile device, run the Expo client app. If you've logged in the URL
    should be in your projects list; tap it and the app will run.

## Other scripts

```bash
# run tests
yarn test
```

### Happy hacking!
