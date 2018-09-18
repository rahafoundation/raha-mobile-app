const fs = require("fs");
const path = require("path");
const plist = require("plist");
const gradle2js = require("gradle-to-js/lib/parser");
const semver = require("semver");
const yargs = require("yargs");

const PLATFORMS = ["packageJson", "ios", "android"];

const packageJsonPath = path.join(__dirname, "..", "package.json");
const iosInfoPlistPath = path.join(
  __dirname,
  "..",
  "ios",
  "Raha",
  "Info.plist"
);
const androidGradleVersionPath = path.join(
  __dirname,
  "..",
  "android",
  "app",
  "version.gradle"
);

/**
 * Get data from package json, info.plist, and build.gradle
 * @param {({android: {versionName, versionCode, fullConfig}, ios: {versionName,
 * buildName, fullConfig}, packageJson: {versionName, fullConfig}}) => void}
 * callback Callback with versions as stored in config files.
 */
function parseVersionData(callback) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const iosInfoPlist = plist.parse(fs.readFileSync(iosInfoPlistPath, "utf8"));

  gradle2js
    .parseText(fs.readFileSync(androidGradleVersionPath, "utf8"))
    .then(versionGradle => {
      const { versionCode, versionName } = versionGradle;
      callback({
        packageJson: {
          versionName: packageJson.version,
          fullConfig: packageJson
        },
        ios: {
          versionName: iosInfoPlist.CFBundleShortVersionString,
          buildName: iosInfoPlist.CFBundleVersion,
          fullConfig: iosInfoPlist
        },
        android: {
          versionName: versionName,
          versionCode: Number.parseInt(versionCode),
          fullConfig: versionGradle
        }
      });
    });
}

/**
 * Throws if any version in package.json, ios, and android is invalid.
 */
function validateVersionNames(data) {
  const validData = PLATFORMS.reduce(
    (memo, platform) => ({
      ...memo,
      [platform]: {
        versionName: data[platform].versionName,
        valid: !!semver.valid(data[platform].versionName)
      }
    }),
    {}
  );
  const invalidPlatforms = Object.keys(validData).filter(
    key => !validData[key].valid
  );
  if (invalidPlatforms.length !== 0) {
    const invalidPlatformsOutput = JSON.stringify(invalidPlatforms);
    const versionDataOutput = JSON.stringify(validData, null, 2);
    throw new Error(
      `Invalid existing version number for the following platforms: ${invalidPlatformsOutput}. Versions found: ${versionDataOutput}`
    );
  }

  // check if they're all consistent; if not show a warning
  if (
    !PLATFORMS.every(
      platform =>
        validData[platform].versionName === validData[PLATFORMS[0]].versionName
    )
  ) {
    // strip out the full config since it's a lot of data to show in a warning
    const versionDataOutput = JSON.stringify(
      Object.keys(data).reduce((memo, platform) => {
        const { fullConfig, ...rest } = data[platform];
        return {
          ...memo,
          [platform]: rest
        };
      }, {}),
      null,
      2
    );
    console.warn(
      "Warning: Android, iOS, and package.json versions are out of sync. Values:",
      versionDataOutput
    );
  }

  if (data.ios.buildName !== 1) {
    console.warn(
      "Warning: iOS build number is not 1; was it incremented manually? Value:",
      validData.ios.buildName
    );
  }
}

function writeIosVersion({ newPath, origPlist, versionName }) {
  const newPlist = {
    ...origPlist,
    CFBundleShortVersionString: versionName,
    CFBundleVersion: "1"
  };
  console.info("Writing iOS Info.plist to temporary file:", newPath);
  fs.writeFileSync(newPath, plist.build(newPlist));
}

function writeAndroidVersion({ newPath, versionName, buildNumber }) {
  const newContents = `versionName="${versionName}"
versionCode=${buildNumber}`;
  console.info("Writing Android version.gradle to temporary file:", newPath);
  fs.writeFileSync(newPath, newContents);
}

function writePackageJson({ newPath, origPackageJSON, versionName }) {
  const newConfig = { ...origPackageJSON, version: versionName };
  console.info("Writing package.json to temporary file:", newPath);
  fs.writeFileSync(newPath, JSON.stringify(newConfig, null, 2));
}

function main() {
  const { release, apply } = yargs
    .option("release", {
      alias: "r",
      desc: "Release type",
      choices: ["major", "minor", "patch"],
      required: true
    })
    .option("apply", {
      alias: "f",
      desc: "Apply changes (default is dry run)",
      type: "boolean",
      default: "false"
    })
    .version(false)
    .help().argv;

  parseVersionData(data => {
    validateVersionNames(data);
    const highestVersion = PLATFORMS.map(
      platform => data[platform].versionName
    ).sort(semver.lt)[0];

    console.info("Previous version:", highestVersion);
    console.info("Previous Android build:", data.android.versionCode);
    const nextVersionName = semver.inc(highestVersion, release);
    const nextAndroidVersionCode = data.android.versionCode + 1;
    console.info("New semantic version:", nextVersionName);
    console.info("New Android build:", nextAndroidVersionCode);

    if (!apply) {
      // dry run
      return;
    }

    const tmpIosPath = iosInfoPlistPath + ".tmp";
    const tmpAndroidPath = androidGradleVersionPath + ".tmp";
    const tmpPackageJsonPath = packageJsonPath + ".tmp";
    writeIosVersion({
      newPath: tmpIosPath,
      origPlist: data.ios.fullConfig,
      versionName: nextVersionName
    });
    writeAndroidVersion({
      newPath: tmpAndroidPath,
      versionName: nextVersionName,
      buildNumber: nextAndroidVersionCode
    });
    writePackageJson({
      newPath: tmpPackageJsonPath,
      origPackageJSON: data.packageJson.fullConfig,
      versionName: nextVersionName
    });

    console.info(
      "Completed writing new configurations; moving them to their proper locations."
    );
    fs.renameSync(tmpIosPath, iosInfoPlistPath);
    fs.renameSync(tmpAndroidPath, androidGradleVersionPath);
    fs.renameSync(tmpPackageJsonPath, packageJsonPath);
  });
}

main();
