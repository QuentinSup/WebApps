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
        var ToggleUIField = kit.fields.ToggleUIField;
        var TextUIField = kit.fields.TextUIField;
        var TextAreaUIField = kit.fields.TextAreaUIField;
        var Query = kit.helpers.Query;
        var MainPage = (function (_super) {
            __extends(MainPage, _super);
            function MainPage() {
                _super.call(this, null);
                this.FromName = new TextUIField('Votre nom', null, true);
                this.FromEmail = new EmailUIField('Votre adresse email', null, true);
                this.FromMessage = new TextAreaUIField('Votre message', null, false);
                this.ToName = new TextUIField('Nom de votre correspondant', null, true);
                this.ToEmail = new EmailUIField('Son adresse email', null, true);
                this.AdrEmailCoche = new ToggleUIField('EmailCoche', true, false, false);
                this.AdrEmailCoche.showLabel(false);
                this.AdrEmail = new EmailUIField('Vérifier son adresse email', null, false);
                this.AdrEmail.placeholder("Saisissez la dernière adresse email connue");
                this.AdrEmail.isDisabled.makeTrueIfNot(this.AdrEmailCoche.dataValue);
                this.AdrPostalCoche = new ToggleUIField('AdrPostaleCoche', true, false, false);
                this.AdrPostalCoche.showLabel(false);
                this.AdrPostalLigne1 = new TextUIField('Vérifier son adresse postale', null, false);
                this.AdrEmail.placeholder("Saisissez la dernière adresse connue");
                this.AdrPostalLigne2 = new TextUIField('', null, false);
                this.AdrPostalLigne3 = new TextUIField('', null, false);
                this.AdrPostalCdPost = new TextUIField('', null, false);
                this.AdrPostalVille = new TextUIField('', null, false);
                this.AdrPostalCdPost.showLabel(false);
                this.AdrPostalVille.showLabel(false);
                this.AdrPostalLigne1.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
                this.AdrPostalLigne2.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
                this.AdrPostalLigne3.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
                this.AdrPostalCdPost.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
                this.AdrPostalVille.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
            }
            /**
             *
             */
            MainPage.prototype.onSubmit = function () {
                var json = {};
                var jsonFrom = {};
                var jsonTo = {};
                var requests = [];
                if (this.AdrEmailCoche.dataValue()) {
                    requests.push({
                        'type': 'email',
                        'value': this.AdrEmail.dataValue()
                    });
                }
                if (this.AdrPostalCoche.dataValue()) {
                    requests.push({
                        'type': 'adress',
                        'value': {
                            'street-address': this.AdrPostalLigne1.dataValue(),
                            'extended-address': this.AdrPostalLigne2.dataValue(),
                            'postal-code': this.AdrPostalCdPost.dataValue(),
                            'locality': this.AdrPostalVille.dataValue()
                        }
                    });
                }
                jsonTo['name'] = this.ToName.dataValue();
                jsonTo['email'] = this.ToEmail.dataValue();
                jsonFrom['name'] = this.FromName.dataValue();
                jsonFrom['message'] = this.FromMessage.dataValue();
                jsonFrom['reply_email'] = this.FromEmail.dataValue();
                json['to'] = jsonTo;
                json['from'] = jsonFrom;
                json['requests'] = requests;
                if (requests.length > 0) {
                    Query.POST(app.servicesPath + 'request', json, function (data, status) {
                    });
                }
            };
            return MainPage;
        })(ViewModel);
        new MainPage().applyBindings("#app");
    })(keepintouch = webapp.keepintouch || (webapp.keepintouch = {}));
})(webapp || (webapp = {}));
//# sourceMappingURL=main.js.map