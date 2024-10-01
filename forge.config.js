const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    // asar: false,

    // algo repo symlinks should be followed
    derefSymlinks: true,


    // CODE SIGNING THINGS GO HERE
    // ---------------------------


    // enable this to create signed executables on macOS
    // XCode and the developer account must be set up to sign executables --
    // more on setting this up:
    // https://github.com/electron/osx-sign

    // object must exist even if empty
    // osxSign: {}


    // END OF CODE SIGNING THINGS
    // --------------------------
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // CODE SIGNING THINGS GO HERE
        // ---------------------------

        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD

        // END OF CODE SIGNING THINGS
        // --------------------------
      },
    },
    {
      name: '@electron-forge/maker-zip',
      // platforms: ['darwin'],
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      // not supported on cross-compilation from OSX -> Windows
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
