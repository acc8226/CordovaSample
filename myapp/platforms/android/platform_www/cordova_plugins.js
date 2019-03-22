cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "org.bar.foo.MyPluginName",
    "file": "plugins/org.bar.foo/www/MyPluginName.js",
    "pluginId": "org.bar.foo",
    "clobbers": [
      "cordova.plugins.MyPluginName"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-device": "2.0.2",
  "org.bar.foo": "0.0.1"
};
// BOTTOM OF METADATA
});