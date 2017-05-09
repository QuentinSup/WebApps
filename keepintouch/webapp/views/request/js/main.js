var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var webapp;
(function (webapp) {
    var keepintouch;
    (function (keepintouch) {
        var ViewModel = kit.ViewModel;
        var EmailUIField = kit.fields.EmailUIField;
        var TextUIField = kit.fields.TextUIField;
        var Query = kit.helpers.Query;
        var RequestConfirmationPage = (function (_super) {
            __extends(RequestConfirmationPage, _super);
            function RequestConfirmationPage() {
                _super.call(this, null);
                this.showEmail = ko.observable(false);
                this.showAdress = ko.observable(false);
                var request_email = request_content.requests.findBy('type', 'email');
                var request_adress = request_content.requests.findBy('type', 'adress');
                this.showEmail(!!request_email);
                this.showAdress(!!request_adress);
                if (request_email) {
                    this.AdrEmail = new EmailUIField('Votre adresse email', request_email.value, true);
                    this.AdrEmail.placeholder("Renseigner votre adresse email");
                }
                if (request_adress) {
                    this.AdrPostalLigne1 = new TextUIField('Votre adresse postale', request_adress.value["street-address"], true);
                    this.AdrPostalLigne2 = new TextUIField('', request_adress.value["extended-address"], false);
                    this.AdrPostalCdPost = new TextUIField('', request_adress.value["postal-code"], true);
                    this.AdrPostalVille = new TextUIField('', request_adress.value["locality"], true);
                    this.AdrPostalLigne2.showLabel(false);
                    this.AdrPostalCdPost.showLabel(false);
                    this.AdrPostalVille.showLabel(false);
                }
            }
            /**
             *
             */
            RequestConfirmationPage.prototype.onSubmit = function () {
                var json = request_content;
                var request_email = request_content.requests.findBy('type', 'email');
                var request_adress = request_content.requests.findBy('type', 'adress');
                if (request_email) {
                    request_email.value = this.AdrEmail.dataValue();
                }
                if (request_adress) {
                    request_adress.value['street-address'] = this.AdrPostalLigne1.dataValue();
                    request_adress.value['extended-address'] = this.AdrPostalLigne2.dataValue();
                    request_adress.value['postal-code'] = this.AdrPostalCdPost.dataValue();
                    request_adress.value['locality'] = this.AdrPostalVille.dataValue();
                }
                Query.PATCH(app.servicesPath + 'request/' + request_id, json, function (data, status) {
                    console.log(data);
                });
            };
            return RequestConfirmationPage;
        })(ViewModel);
        new RequestConfirmationPage().applyBindings("#app");
    })(keepintouch = webapp.keepintouch || (webapp.keepintouch = {}));
})(webapp || (webapp = {}));
//# sourceMappingURL=main.js.map