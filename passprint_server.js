PassPrint = {};

const PASSPRINT_ACCOUNTS = "http://dev.accounts.passprint.me:3330";

PassPrint.handleAuthFromAccessToken = function handleAuthFromAccessToken(accessToken, expiresAt) {
    // include all fields from passprint
    var whitelisted = ['id', 'email', 'name', 'profile_picture',
        'birthday'];

    var identity = getIdentity(accessToken, whitelisted);

    var serviceData = {
        accessToken: accessToken,
        expiresAt: expiresAt
    };

    var fields = _.pick(identity, whitelisted);
    _.extend(serviceData, fields);

    return {
        serviceData: serviceData,
        options: {profile: {name: identity.name}}
    };
};

OAuth.registerService('passprint', 2, null, function(query) {
    var response = getTokenResponse(query);
    var accessToken = response.accessToken;
    var expiresIn = response.expiresIn;

    return PassPrint.handleAuthFromAccessToken(accessToken, (+new Date) + (1000 * expiresIn));
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'passprint'});
    if (!config)
        throw new ServiceConfiguration.ConfigError();

    var responseContent;
    try {
        // Request an access token
        responseContent = HTTP.post(
            PASSPRINT_ACCOUNTS + "/oauth2/access_token", {
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                params: {
                    client_id: config.clientId,
                    redirect_uri: OAuth._redirectUri('passprint', config),
                    client_secret: OAuth.openSecret(config.secret),
                    code: query.code
                }
            }).content;
    } catch (err) {
        throw _.extend(new Error("Failed to complete OAuth handshake with PassPrint. " + err.message),
            {response: err.response});
    }

    // Success!  Extract the passprint access token and expiration
    // time from the response
    var parsedResponse = JSON.parse(responseContent);
    var accessToken = parsedResponse.access_token;
    var expires = parsedResponse.expires_in;

    if (!accessToken) {
        throw new Error("Failed to complete OAuth handshake with PassPrint " +
            "-- can't find access token in HTTP response. " + responseContent);
    }
    return {
        accessToken: accessToken,
        expiresIn: expires
    };
};

var getIdentity = function (accessToken, fields) {
    try {
        return HTTP.get(PASSPRINT_ACCOUNTS + "/api/v1/user/getIdentity", {
            params: {
                access_token: accessToken,
                fields: fields
            }
        }).data;
    } catch (err) {
        throw _.extend(new Error("Failed to fetch identity from PassPrint. " + err.message),
            {response: err.response});
    }
};

PassPrint.retrieveCredential = function(credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};