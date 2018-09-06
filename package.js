Package.describe({
    name: 'diamondfortress:passprint',
    version: "1.0.0",
    // Brief, one-line summary of the package.
    summary: "PassPrint OAuth2 flow",
    // URL to the Git repository containing the source code for this package.
    git: "https://github.com/DFTinc/atmosphere-passprint.git",
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.use('oauth2', ['client', 'server']);
    api.use('oauth', ['client', 'server']);
    api.use('http', ['server']);
    api.use('templating@1.2.13', 'client');
    api.use('underscore', 'server');
    api.use('random', 'client');
    api.use('service-configuration', ['client', 'server']);

    api.export('PassPrint');

    api.addFiles(
        ['passprint_configure.html', 'passprint_configure.js'],
        'client');

    api.addFiles('passprint_server.js', 'server');
    api.addFiles('passprint_client.js', 'client');
});