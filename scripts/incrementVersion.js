const fs = require("fs");
const path = require("path");
const plist = require("plist");
const gradle2js = require("gradle-to-js/lib/parser");
const semver = require("semver");
const yargs = require("yargs");
const chalk = require("chalk");
const PromptConfirm = require("prompt-confirm");
const process = require("process");
const os = require("os");

const VERSION_LOCATIONS = [
  "packageJson",
  "ios",
  "android",
  "testConfig",
  "prodConfig"
];
const CODEPUSH = "codepush";

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
const testConfigPath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "test.config.ts"
);
const prodConfigPath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "prod.config.ts"
);
const configAppVersionRegexTemplate = /((appVersion)|("appVersion"))\s*:\s*"(.*)"/g;
const configIosCodepushVersionRegexTemplate = /((iosCodepushVersion)|("iosCodepushVersion"))\s*:\s*(\d+)/g;
const configAndroidCodepushVersionRegexTemplate = /((androidCodepushVersion)|("androidCodepushVersion"))\s*:\s*(\d+)/g;

/**
 * Gets version data from the given config file.
 * @params config: The full text of the config file, configName: (for-display-only) name of the configuration.
 * @returns {appVersion, androidCodepushVersion, iosCodepushVersion}
 */
function parseConfigVersionData(config, configName) {
  const configAppVersionRegexResult = new RegExp(
    configAppVersionRegexTemplate
  ).exec(config);
  if (!configAppVersionRegexResult) {
    throw new Error(`Could not find key appVersion in ${configName} config.`);
  }
  const configIosCodepushVersionRegexResult = new RegExp(
    configIosCodepushVersionRegexTemplate
  ).exec(config);
  if (!configIosCodepushVersionRegexResult) {
    throw new Error(
      `Could not find key iosCodepushVersion in ${configName} config.`
    );
  }
  const configAndroidCodepushVersionRegexResult = new RegExp(
    configAndroidCodepushVersionRegexTemplate
  ).exec(config);
  if (!configAndroidCodepushVersionRegexResult) {
    throw new Error(
      `Could not find key androidCodepushVersion in ${configName} config.`
    );
  }
  return {
    appVersion: configAppVersionRegexResult[4],
    androidCodepushVersion: Number.parseInt(
      configAndroidCodepushVersionRegexResult[4]
    ),
    iosCodepushVersion: Number.parseInt(configIosCodepushVersionRegexResult[4])
  };
}

/**
 * Get data from package json, info.plist, build.gradle, test.config.ts, and prod.config.ts.
 * @returns {Promise<{android: {versionName, versionCode, fullConfig}, ios: {versionName,
 * buildName, fullConfig}, packageJson: {versionName, fullConfig}}>}
 */
function parseVersionData() {
  return new Promise(resolve => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const iosInfoPlist = plist.parse(fs.readFileSync(iosInfoPlistPath, "utf8"));

    const testConfig = fs.readFileSync(testConfigPath, "utf8");
    const prodConfig = fs.readFileSync(prodConfigPath, "utf8");
    const testConfigVersionData = parseConfigVersionData(testConfig, "test");
    const prodConfigVersionData = parseConfigVersionData(prodConfig, "prod");

    gradle2js
      .parseText(fs.readFileSync(androidGradleVersionPath, "utf8"))
      .then(versionGradle => {
        const { versionCode, versionName } = versionGradle;
        resolve({
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
          },
          testConfig: {
            versionName: testConfigVersionData.appVersion,
            iosCodepushVersion: testConfigVersionData.iosCodepushVersion,
            androidCodepushVersion:
              testConfigVersionData.androidCodepushVersion,
            fullConfig: testConfig
          },
          prodConfig: {
            versionName: prodConfigVersionData.appVersion,
            iosCodepushVersion: prodConfigVersionData.iosCodepushVersion,
            androidCodepushVersion:
              prodConfigVersionData.androidCodepushVersion,
            fullConfig: prodConfig
          }
        });
      });
  });
}

/**
 * Throws if any version in package.json, ios, android, testConfig, prodConfig is invalid.
 */
function validateVersionNames(data) {
  const validData = VERSION_LOCATIONS.reduce(
    (memo, location) => ({
      ...memo,
      [location]: {
        versionName: data[location].versionName,
        valid: !!semver.valid(data[location].versionName)
      }
    }),
    {}
  );
  const invalidLocation = Object.keys(validData).filter(
    key => !validData[key].valid
  );
  if (invalidLocation.length !== 0) {
    const invalidLocationsOutput = JSON.stringify(invalidLocation);
    const versionDataOutput = JSON.stringify(validData, null, 2);
    throw new Error(
      `Invalid existing version number for the following locations: ${invalidLocationsOutput}. Versions found: ${versionDataOutput}`
    );
  }

  // check if they're all consistent; if not show a warning
  if (
    !VERSION_LOCATIONS.every(
      location =>
        validData[location].versionName ===
        validData[VERSION_LOCATIONS[0]].versionName
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
      chalk.yellow(
        "Warning: Android, iOS, package.json, testConfig, and prodConfig versions are out of sync."
      ),
      "Values:",
      chalk.bold(versionDataOutput)
    );
  }

  if (data.ios.buildName !== "1") {
    console.warn(
      chalk.yellow(
        "Warning: iOS build number is not 1; was it incremented manually?"
      ),
      "Value:",
      chalk.bold(validData.ios.buildName)
    );
  }
}

function writeIosVersion({ newPath, origPlist, versionName }) {
  const newPlist = {
    ...origPlist,
    CFBundleShortVersionString: versionName,
    CFBundleVersion: "1"
  };
  console.info(
    "Writing iOS Info.plist to temporary file:",
    chalk.bold(newPath)
  );
  fs.writeFileSync(newPath, plist.build(newPlist) + os.EOL);
  console.info(chalk.green("Wrote ios Info.plist.tmp!"));
}

function writeAndroidVersion({ newPath, versionName, buildNumber }) {
  const newContents = `versionName=${versionName}
versionCode=${buildNumber}`;
  console.info(
    "Writing Android version.gradle to temporary file:",
    chalk.bold(newPath)
  );
  fs.writeFileSync(newPath, newContents + os.EOL);
  console.info(chalk.green("Wrote Android version.gradle.tmp!"));
}

function writePackageJson({ newPath, origPackageJSON, versionName }) {
  const newConfig = {
    ...origPackageJSON,
    version: versionName,
    config: { version: versionName }
  };
  console.info("Writing package.json to temporary file:", chalk.bold(newPath));
  fs.writeFileSync(newPath, JSON.stringify(newConfig, null, 2) + os.EOL);
  console.info(chalk.green("Wrote package.json.tmp!"));
}

function writeConfig({
  configName,
  newPath,
  origConfig,
  versionName,
  iosCodepushVersion,
  androidCodepushVersion
}) {
  console.info(
    `Writing ${configName} config to temporary file:`,
    chalk.bold(newPath)
  );
  const newConfig = origConfig
    .replace(
      new RegExp(configAppVersionRegexTemplate),
      `appVersion: "${versionName}"`
    )
    .replace(
      new RegExp(configIosCodepushVersionRegexTemplate),
      `iosCodepushVersion: ${iosCodepushVersion}`
    )
    .replace(
      new RegExp(configAndroidCodepushVersionRegexTemplate),
      `androidCodepushVersion: ${androidCodepushVersion}`
    );
  fs.writeFileSync(newPath, newConfig);
  console.info(chalk.green(`Wrote ${configName} config!`));
}

function generateAndSaveConfigs({ release, apply }) {
  parseVersionData().then(data => {
    validateVersionNames(data);
    const highestVersion = VERSION_LOCATIONS.map(
      location => data[location].versionName
    ).sort(semver.lt)[0];

    console.info("Previous semantic version:", chalk.bold(highestVersion));
    console.info(
      "Previous Android version code:",
      chalk.bold(data.android.versionCode)
    );
    console.info(
      "Previous iOS Codepush version code:",
      chalk.bold(data.prodConfig.iosCodepushVersion)
    );
    console.info(
      "Previous Android Codepush version code:",
      chalk.bold(data.prodConfig.androidCodepushVersion)
    );

    const nextVersionName =
      release === CODEPUSH
        ? highestVersion
        : semver.inc(highestVersion, release);
    const nextAndroidVersionCode =
      release === CODEPUSH
        ? data.android.versionCode
        : data.android.versionCode + 1;
    const nextIosCodepushVersionCode =
      release === CODEPUSH
        ? data.prodConfig.iosCodepushVersion + 1
        : data.prodConfig.iosCodepushVersion;
    const nextAndroidCodepushVersionCode =
      release === CODEPUSH
        ? data.prodConfig.androidCodepushVersion + 1
        : data.prodConfig.androidCodepushVersion;

    if (release === CODEPUSH) {
      console.info(
        chalk.bold("Semantic and Android version codes have not changed.")
      );
      console.info(
        chalk.bold("New iOS Codepush version code:"),
        chalk.blue(chalk.underline(chalk.bold(nextIosCodepushVersionCode)))
      );
      console.info(
        chalk.bold("New Android Codepush version code:"),
        chalk.blue(chalk.underline(chalk.bold(nextAndroidCodepushVersionCode)))
      );
    } else {
      console.info(
        chalk.bold("New semantic version:"),
        chalk.blue(chalk.underline(chalk.bold(nextVersionName)))
      );
      console.info(
        chalk.bold("New Android version code:"),
        chalk.blue(chalk.underline(chalk.bold(nextAndroidVersionCode)))
      );
      console.info(chalk.bold("Codepush versions have not changed."));
    }

    const tmpIosPath = iosInfoPlistPath + ".tmp";
    const tmpAndroidPath = androidGradleVersionPath + ".tmp";
    const tmpPackageJsonPath = packageJsonPath + ".tmp";
    const tmpTestConfigPath = testConfigPath + ".tmp";
    const tmpProdConfigPath = prodConfigPath + ".tmp";
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
    writeConfig({
      configName: "test",
      newPath: tmpTestConfigPath,
      origConfig: data.testConfig.fullConfig,
      versionName: nextVersionName,
      iosCodepushVersion: nextIosCodepushVersionCode,
      androidCodepushVersion: nextAndroidCodepushVersionCode
    });
    writeConfig({
      configName: "prod",
      newPath: tmpProdConfigPath,
      origConfig: data.prodConfig.fullConfig,
      versionName: nextVersionName,
      iosCodepushVersion: nextIosCodepushVersionCode,
      androidCodepushVersion: nextAndroidCodepushVersionCode
    });

    console.info(
      chalk.green("Completed writing new configurations to temporary files.")
    );

    if (!apply) {
      // dry run
      console.info("Quitting: --apply flag not set.");
      return;
    }

    console.info("Moving them to their proper locations.");

    fs.renameSync(tmpIosPath, iosInfoPlistPath);
    fs.renameSync(tmpAndroidPath, androidGradleVersionPath);
    fs.renameSync(tmpPackageJsonPath, packageJsonPath);
    fs.renameSync(tmpTestConfigPath, testConfigPath);
    fs.renameSync(tmpProdConfigPath, prodConfigPath);
    console.info(chalk.green("Process is complete. Exiting."));
  });
}

function main() {
  const { release, apply } = yargs
    .option("release", {
      alias: "r",
      desc: "Release type",
      choices: ["major", "minor", "patch", CODEPUSH],
      required: true
    })
    .option("apply", {
      alias: ["a", "f"],
      desc: "Apply changes (default is dry run)",
      type: "boolean",
      default: "false"
    })
    .version(false)
    .help().argv;

  if (apply) {
    console.info(
      chalk.red(
        "The --apply flag is present; this will update config versions."
      )
    );
    return new PromptConfirm({
      message: "Do you wish to continue?",
      default: false
    })
      .run()
      .then(answer => {
        if (!answer) {
          console.info(chalk.bold("User aborted."));
          process.exit(-1);
        }
      })
      .then(() => generateAndSaveConfigs({ release, apply }));
  }
  console.info(
    chalk.blue(
      "Because --apply flag is not present, this will only write changes to temporary files, and not edit the originals."
    )
  );

  generateAndSaveConfigs({ release, apply });
}

main();
