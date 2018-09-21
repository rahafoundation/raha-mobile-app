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

**NOTE**: These commands change configuration not just in JavaScript, but also
in the native apps; so if the app is running already, you'll need to rebuild it.

## Running the app...

### ...on an iPhone simulator:

Run `yarn start:ios`, and it an iPhone simulator running the code should start.

### ... on physical iOS devices:

You need to set up your environment.

First start by making sure you've done all the setup instructions in the
"Building Projects with Native Code" section of the [React Native Getting
Started guide](http://facebook.github.io/react-native/docs/getting-started.html)
for your platform. For instance, you need Android Studio if you're building for
Android, whose installation instructions are explained there.

Then, refer to [the instructions in the "Running On Device
section"](https://facebook.github.io/react-native/docs/running-on-device.html).
You will need a USB cable to connect your phone to your computer.

Once you've done so, then plug in your device via USB and...

#### ... on Android:

If you aren't set up yet for Android development yet, install Android Studio,
be sure to set `ANDROID_HOME` (eg `export ANDROID_HOME=~/Library/Android/sdk/`)
and accept all licenses (run `$ANDROID_HOME/tools/bin/sdkmanager --licenses`).

Run `yarn start:android:test` or `yarn start:android:prod` depending on the
environment you want to run.

##### Adding your Android debug signature to Firebase

It won't allow you authenticate with Google services until you register your
computer's signature with Firebase's website. To do so, first run this command
to see your Android debug signatures:

```bash
# If it asks you for a keystore password, the default is "android" (without quotes)
keytool -exportcert -list -v \
-alias androiddebugkey -keystore ~/.android/debug.keystore
```

Copy the SHA1 certificate fingerprint. Then, go to the Android configurations
for both [the dev test
app](https://console.firebase.google.com/u/0/project/raha-test/settings/general/android:app.raha.mobileTest)
and [the dev prod
app](https://console.firebase.google.com/u/0/project/raha-5395e/settings/general/android:app.raha.mobileProd).

Click "Add Fingerprint" under the "SHA certificate fingerprints" section, and
paste in the same SHA fingerprint in both apps. It looks like this:

![Screenshot of "Add Fingerprint" button in Firebase
Console](setup-instructions/sha-fingerprint.png)

Then download the `google-services.json` from the prod app and replace `android/data/config/firebase/google-services.prod.json` and the one from the test app and replace `android/data/config/firebase/google-services.test.json`.

Now Google Services should all work in development for you.

##### Other tips

It also helps to run `adb reverse tcp:8081 tcp:8081` so that the React Native
packager can transfer the source code over USB instead of via Wi-Fi, especially
in networks that block your computer from connecting to your phone, like in
public places.

## Troubleshooting

### Android build errors

- Ensure you are using Java JDK 1.8, as that's the only version supported.

### iOS build errors

- As of 2018/09/21, when iOS 12 and XCode 12 was released, the XCode build system got
  updated. The new build system errors when trying to build React Native. Hopefully
  Facebook resolves this soon, but in the meantime use the Legacy Builder [as explained
  in this comment](https://github.com/facebook/react-native/issues/20774#issuecomment-422607019).
  
### Deep/Universal Linking

We use the Branch service to create and respond to deep links to accept invites.
You can send an invite from an existing member, and from a logged out state,
accept the invite by activating the deep link.

Deep links (called universal links in iOS when referring to ones without a custom 
protocol, like `raha://`) are of the following format:

```
https://to.raha.app/invite?t=<token_string>
```

The custom protocol deep links are of the following format:

```
raha://link/invite?t=<token_string>
```

#### Testing on iOS:

Haven't explored a way yet to test Universal Links without actually just clicking on
a url that matches the expected deep and universal link formats above.

#### Testing on Android:

- Clicking on a recognized HTTPS link (typing the URL manually
  into Chrome doesn't work): [https://to.raha.app/invite?t=0bzeq0zyfrbe](https://to.raha.app/i?t=0bzeq0zyfrbe)
- via ADB:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "raha://link/invite?t=0bzeq0zyfrbe" app.raha.mobileTest
```

## Debugger

Install [`react-native-debugger`](https://github.com/jhen0409/react-native-debugger):

```bash
brew update && brew cask install react-native-debugger
```

- Ensure no debugger windows are open (in Chrome), and run React Native
  Debugger.
- Shake your phone, and hit `Debug JS Remotely`.

## Other scripts

```bash
yarn test  # run tests
```

### Testing Gotchas

Tests still don't run/exist. :( We're working on getting them to work... but
`react-native` and prioritization are proving difficult.

- If you add a library and tests break becuase of errors like `SyntaxError` for
  an `import` statement being present or other things that look like the
  javascript isn't being downcompiled to something Node can understand, you
  should add the offending package to the `transformIgnorePatterns` field in
  `package.json`. Jest requires code from external dependencies to use code Node
  can natively run, but many `react-native` libraries
  don't downcompile their code before publishing, causing the issue.
  [More details here](https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization).

## Development environment

I recommend [using VSCode](https://code.visualstudio.com/) to edit your code
because its tooling for TypeScript and React Native is solid. In particular, I
recommend navigating to the recommended extensions and installing them:

![Screenshot of Recommended Extensions pane in
VSCode](setup-instructions/recommended-extensions.png)

I also recommend you run a script in VSCode that will tell you all the
TypeScript errors in your entire codebase as you code. To do so, go to Tasks >
Run Build Task, and then run the `tsc: watch - tsconfig.dev.json` script.

### Happy hacking!
