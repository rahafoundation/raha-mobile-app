# Deploying the app

There are multiple ways to push updates:

1. Android Play Store/iOS App Store updates

- Relatively slow, especially for iOS, which requires App Store approval.
- Necessary for changes to native dependencies, permissions, etc.
- Should be used for significant code changes.

2. AppCenter Codepush

- Much faster.
- Push updates to certain resources, namely Javascript code and some image
  assets, without the App Store process.
- Should be used largely for small changes like bugfixes.

## Publishing apps on the App Store

We're keeping the versions of Android, iOS, and package.json equal.
So, first, bump the app version:

```bash
yarn bumpVersion -r [major|minor|patch] --apply
```

This will increment the version for the iOS app, Android app, and package.json.
Add all the version bump changes to `git`, and then commit it:

```bash
git commit -m "v0.1.2" # or whatever it is
git tag v0.1.2
git push
git push --tags
```

### iOS

1. Run `yarn config:deploy`.
1. If you have not already, create and install on your local machine a
   distribution certificate by following the instructions at: https://developer.apple.com/account/ios/certificate/
   (NOTE: MAKE SURE YOU SECURE THIS CERTIFICATE, AS IT CAN BE USED TO PUSH UPDATES
   TO ALL OUR USERS. I saved mine in 1password and deleted the original file.)
1. Download and copy `private.xcconfig` from Keybase into `ios/BuildConfig`. It contains the iOS CodePush deployment keys. Make sure to reopen XCode to refresh the configurations.
1. Go to XCode
1. Next to the Play and Stop buttons at the top, choose a device for the Raha
   target that allows for publication. If you need to register a device, let me
   know; but I think `Generic iOS Device` should work.
1. Click `Product -> Archive`.
1. Once archiving is done, click `Distribute App`
1. If you have a distribution certificate installed as described in the first step, you
   should be able to let Apple automatically manage signing when presented with that
   option.
1. Once the upload is complete, wait for Apple to finish processing the app.
   (You can monitor this from the "Activity" tab of appstoreconnect.apple.com.)
1. Then submit the app for review through `appstoreconnect.apple.com`.

### Android

1.  Download and copy the `release.keystore` from KeyBase somewhere locally and copy the signing
   and CodePush deployment keys from `gradle.properties` into your `~/.gradle/gradle.properties`.
    Adjust the keystore path accordingly (use an absolute path).
1.  Run `yarn bundle:android` to create a bundled and signed APK in
    `./android/app/build/outputs/apk/prod/release/app-prod-release.apk`.
1.  You can install this APK on your physical device through `adb install PATH.apk`. Do a sanity check pass to make sure the app doesn't break.
1.  Submit the app through [Google Play
    Console](https://play.google.com/apps/publish/?account=4907477562070921278)
    via `Release Management > App Releases > Production Track > Manage > Create Release`.

## Deploying updates via AppCenter CodePush

Minor JS updates can be deployed to the app without having to go through the App Store
approval process by using codepush.

Note: new codepush releases are automatically targeted to the current version of the app,
so we should never need to both release to codepush and publish to the app store.

### Setting up Appcenter and CodePush on your local machine

1. Make sure you have the latest dependencies installed by running `yarn install`.
1. Login to appcenter via `yarn run appcenter login`.

### Releasing an update to CodePush

Under normal circumstances, we'd like to release to Android and iOS simultaneously to avoid versions getting out of sync.

TODO: Update what extraordinary circumstances are if we ever encounter them.

1. [Build a pre-push Staging build](#staging-build-for-testing).
1. Run `yarn codepush:[android|ios]:release`.
1. Verify that your Staging build has received the new update.
1. Once you've verified the update is working, run `yarn codepush:[android|ios]:promote` to promote
   the staging update to the Production environment. All app installs via the app stores
   should then receive this update.
1. Once you've promoted a codepush release, tag the current commit with the codepush release label with
   `git tag -a codepush-[android|ios]-[label]`. You can list the labels of production codepush releases by
   using `yarn codepush:[android|ios]:history:production`.

### Staging Build for Testing

#### Android

1. Go to a commit without the new change but with the same app version number.
1. Install a non-prod version via `./gradlew assembleDevProdRelease`, which is
   built with the Staging keys.

#### iOS

1. Go to a commit without the new change but with the same app version number.
1. In XCode, go to `Product -> Scheme -> Edit Scheme...` (all the way at the
   bottom)
1. Edit "Run" task (with the play button) "Build Configuration" to "Staging"
1. Press the play button to install a bundled staging build onto your device
1. This may have changed our default project scheme -- please revert these changes.
