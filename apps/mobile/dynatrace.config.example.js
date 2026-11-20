// Rename to dynatrace.config.js, fill in values from Dynatrace (Mobile app > Instrumentation wizard),
// add "@dynatrace/react-native-plugin" to app.json "plugins", then `npx expo prebuild`.
module.exports = {
  react: {
    debug: false,
    lifecycle: { includeUpdate: false },
  },
  android: {
    config: `
      dynatrace {
        configurations {
          defaultConfig {
            autoStart {
              applicationId '<YOUR_APPLICATION_ID>'
              beaconUrl '<YOUR_BEACON_URL>'
            }
            userOptIn false
            agentBehavior.startupLoadBalancing true
          }
        }
      }
    `,
  },
  ios: {
    config: `
      <key>DTXApplicationID</key>
      <string><YOUR_APPLICATION_ID></string>
      <key>DTXBeaconURL</key>
      <string><YOUR_BEACON_URL></string>
      <key>DTXLogLevel</key>
      <string>ALL</string>
    `,
  },
};
