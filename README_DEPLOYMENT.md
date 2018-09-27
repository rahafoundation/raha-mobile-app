# Deploying the app

There are multiple ways to push updates:

1. Android Play Store/iOS App Store updates

- Relatively slow, especially for iOS, which requires App Store approval.
- Necessary for changes to native dependencies, permissions, etc.
- Should be used for significant code changes.

1. AppCenter Codepush

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

1. If you have not already, create and install on your local machine a
   distribution certificate by following the instructions at: https://developer.apple.com/account/ios/certificate/
   (NOTE: MAKE SURE YOU SECURE THIS CERTIFICATE, AS IT CAN BE USED TO PUSH UPDATES
   TO ALL OUR USERS. I saved mine in 1password and deleted the original file.)
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
1. Then submit the app for review through appstoreconnect.apple.com.

### Android

1.  Download and copy the `release.keystore` somewhere locally and copy the signing
    keys from `release-signing.txt` into your `~/.gradle/gradle.properties`.
    Adjust the keystore path accordingly (use an absolute path).
1.  Increment the `versionCode` and `versionName` values in `android/app/build.gradle`'s `defaultConfig` block.
    `versionCode` is how updates are triggered for end users and `versionName` is major.minor.patch semantic versioning.
    See: https://developer.android.com/studio/publish/versioning for more details.
1.  Run `yarn bundle:android` to create a bundled and signed APK in
    `./android/app/build/outputs/apk/prod/release/app-prod-release.apk`.
1.  You can install this APK on your physical device through `adb install PATH.apk`.
1.  Add a git tag for the version `vx.x.x` See: https://git-scm.com/book/en/v2/Git-Basics-Tagging

Note, to build dev versions of the app - you can use the following commands:

1. `yarn config:[prod|test]` - this controls whether you're running against the prod/test api
1. `cd android`
1. `./gradlew assemble[DevProd|DevTest|Prod]Release`
1. adb install as described above.

## Deploying updates via AppCenter CodePush

Minor JS updates can be deployed to the app without having to go through the App Store
approval process by using codepush.

Note: new codepush releases are automatically targeted to the current version of the app,
so we should never need to both release to codepush and publish to the app store.

### Setting up Appcenter and Codepush on your local machine

1. Make sure you have the latest dependencies installed by running `yarn install`.
1. Login to appcenter via `yarn run appcenter login`.

#### Android

Add the codepush Android deployment keys to your `~/.gradle/gradle.properties` file so that
so that your builds contain the proper codepush keys. The codepush deployment keys
are shared via keybase.

#### iOS

Add the codepush iOS deployment keys to your buildconfig settings.

1. Copy and rename the `ios/BuildConfig/template.<debug/release>.xcconfig files` by removing the "template." prefix.
1. Retrieve the codepush keys from keybase in the `iOS` directory and update the relevant values in the new config files you just created.

### Releasing an update to codepush

Under normal circumstances, we'd like to release to Android and iOS simultaneously to avoid versions getting out of sync.

TODO: Update what extraordinary circumstances are if we ever encounter them.

1. Run `yarn codepush:[android|ios]:release`. This will push a codepush update using our Staging
   key which all non-prod-release builds use. Test that the update looks correct on
   one of these builds.
1. Once you've verified the update is working, run `yarn codepush:[android|ios]:promote` to promote
   the staging update to the Production environment. All app installs via the app stores
   should then receive this update.
1. Once you've promoted a codepush release, tag the current commit with the codepush release label with
   `git tag -a codepush-[android|ios]-[label]`. You can list the labels of production codepush releases by
   using `yarn codepush:[android|ios]:history:production`.
