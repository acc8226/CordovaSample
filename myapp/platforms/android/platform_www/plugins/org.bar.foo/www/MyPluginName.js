cordova.define("org.bar.foo.MyPluginName", function(require, exports, module) {
var exec = require('cordova/exec');

exports.coolMethod = function (arg0, success, error) {
    exec(success, error, 'MyPluginName', 'coolMethod', [arg0]);
};

});
