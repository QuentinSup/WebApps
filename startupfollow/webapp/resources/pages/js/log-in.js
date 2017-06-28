var colaunch;
(function (colaunch) {
    var Model = (function () {
        function Model() {
            this.name = ko.observable();
            this.email = ko.observable();
            this.password = ko.observable();
            this.redirectTo = ko.observable();
            this.isCheckingLogin = ko.observable(false);
            this.isCheckingPassword = ko.observable(false);
        }
        Model.prototype.login = function () {
            var _this = this;
            this.isCheckingLogin(true);
            var data = {
                name: this.name(),
                password: this.password()
            };
            var request = {
                type: 'post',
                url: host + 'rest/user/auth',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                _this.isCheckingLogin(false);
                if (response.status == 200) {
                    toast("Bienvenue " + _this.name() + " ;)");
                    document.location.href = host + _this.redirectTo() || '';
                }
                else {
                    _this.password('');
                    error("Oups ! Votre identifiant ou votre mot de passe est incorrect");
                }
            });
        };
        /**
         * Show form to retrieve password
         */
        Model.prototype.showForgotPasswordForm = function () {
            $('#form').formslider('animate:1');
        };
        /**
         * Send request to retrieve password
         */
        Model.prototype.retrievePassword = function () {
            var _this = this;
            if (!this.email().trim()) {
                toast("Merci de renseigner l'adresse email de votre compte");
                return;
            }
            if (!isValidEmail(this.email())) {
                toast("Cette adresse email ne semble pas valide");
                return;
            }
            this.isCheckingPassword(true);
            var data = {
                email: this.email()
            };
            var request = {
                type: 'delete',
                url: host + 'rest/user/password',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                _this.isCheckingPassword(false);
                if (response.status == 200) {
                    success("Done ! Un nouveau mot de passe vous a été envoyé par email !");
                    $('#form').formslider('animate:0');
                }
                else {
                    error("Oups ! Il semble qu'une erreur nous empêche de vous communiquer un nouveau mot de passe. Êtes-vous sûr qu'il s'agit bien de votre adresse email associée à votre compte ?");
                }
            });
        };
        return Model;
    })();
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
})(colaunch || (colaunch = {}));
//# sourceMappingURL=log-in.js.map