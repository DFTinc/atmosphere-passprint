PassPrint = {};

const PASSPRINT_ACCOUNTS = "http://dev.accounts.passprint.me:3330";

// Request PassPrint credentials for the user
//
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
PassPrint.requestCredential = function (options, credentialRequestCompleteCallback) {
    // support both (options, callback) and (callback).
    if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = {};
    }

    var config = ServiceConfiguration.configurations.findOne({service: 'passprint'});
    if (!config) {
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(
            new ServiceConfiguration.ConfigError());
        return;
    }

    var credentialToken = Random.secret();
    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    var display = mobile ? 'touch' : 'popup';

    var scope = "email";
    if (options && options.requestPermissions)
        scope = options.requestPermissions.join(',');

    var loginStyle = OAuth._loginStyle('passprint', config, options);

    var loginUrl =
        PASSPRINT_ACCOUNTS + '/auth/oauth2/authorize' +
        '?client_id=' + config.clientId +
        '&redirect_uri=' + OAuth._redirectUri('passprint', config) +
        '&scope=' + scope +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)
        '&response_type=code';

    // Handle authentication type (e.g. for force login you need authType: "reauthenticate")
    if (options && options.auth_type) {
        loginUrl += "&auth_type=" + encodeURIComponent(options.auth_type);
    }

    OAuth.launchLogin({
        loginService: "passprint",
        loginStyle: loginStyle,
        loginUrl: loginUrl,
        credentialRequestCompleteCallback: credentialRequestCompleteCallback,
        credentialToken: credentialToken
    });
};