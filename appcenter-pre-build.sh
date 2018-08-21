#!/usr/bin/env bash
# This script is called automatically during the App Center build process, see https://docs.microsoft.com/en-us/appcenter/build/custom/scripts/.
set -e

if [ -z "$APPCENTER_SECRET" ]; then
    echo 'You must set APPCENTER_SECRET environment variable via the AppCenter UI for the appcenter-pre-build.sh script to work';
    exit 1;
fi

# TODO enable below lines when "yarn test" is working
# yarn config:test
# yarn test

yarn config:prod

if [ "$(uname)" == "Darwin" ]; then
    # Compiling for iOS on Darwin
    sed -i '' "s/\$APPCENTER_SECRET/$APPCENTER_SECRET/g" ios/mobile/AppCenter-Config.plist
else
    # Compiling for Android on Linux
    sed -i "s/\$APPCENTER_SECRET/$APPCENTER_SECRET/g" android/app/src/main/assets/appcenter-config.json
fi
