# Deploying the app

Currently, we are only publishing the app on the Android marketplace. Publishing for iOS is
pending App Store approval.

However, we have two mechansims for pushing updates to our apps - one is via App Store updates,
and the other is via AppCenter Codepush, which allows us to push updates to certain app resources,
namely Javascript code and some image assets, outside of the app store update process. Codepush should
be used largely for small changes like bugfixes.

## Building the app for publishing

### Android

1.  Download and copy the `release.keystore` somewhere locally and copy the signing
    keys from `release-signing.txt` into your `~/.gradle/gradle.properties`.
    Adjust the keystore path accordingly (use an absolute path).
1.  Update the `versionCode` and `versionName` values in `android/app/build.gradle`'s `defaultConfig` block.
    See: https://developer.android.com/studio/publish/versioning for more details.
1.  Run `yarn bundle:android` to create a bundled and signed APK in
    `./android/app/build/outputs/apk/prod/release/app-prod-release.apk`.
1.  You can install this APK on your physical device through `adb install PATH.apk`.

## Deploying JS updates via codepush

Minor JS updates can be deployed to the app without having to go through the App Store
approval process by using codepush.

Note: new codepush releases are automatically targeted to the current version of the app,
so we should never need to both release to codepush and publish to the app store.

### Setting up Appcenter and Codepush on your local machine

1. Make sure you have the latest dependencies installed by running `yarn install`.
1. Login to appcenter via `yarn run appcenter login`.
1. Add the codepush Android deployment keys to your `~/.gradle/gradle.properties` file so that
   so that your builds contain the proper codepush keys. The codepush deployment keys
   are shared via keybase.

### Releasing an update to codepush

1. Run `yarn codepush:release`. This will push a codepush update using our Staging
   key which all non-prod-release builds use. Test that the update looks correct on
   one of these builds.
1. Once you've verified the update is working, run `yarn codepush:promote` to promote
   the staging update to the Production environment. All app installs via the app stores
   should then receive this update.
