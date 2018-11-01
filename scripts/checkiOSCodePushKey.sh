#!/bin/bash

if test -e ./ios/BuildConfig/private.xcconfig;
then
    true;
else
    echo "iOS CodePush deployment keys should not be missing in production build.";
    false;
fi
