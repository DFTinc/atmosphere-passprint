Template.configureLoginServiceDialogForPassPrint.helpers({
    siteUrl: function () {
        return Meteor.absoluteUrl();
    }
});

Template.configureLoginServiceDialogForPassPrint.fields = function () {
    return [
        {property: 'clientId', label: 'Client ID'},
        {property: 'secret', label: 'Client Secret'}
    ];
};