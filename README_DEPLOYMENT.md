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

## Deploying JS updates via codepush

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
