var startupfollows;
(function (startupfollows) {
    var startup;
    (function (startup) {
        var Model = (function () {
            function Model() {
                var _this = this;
                this.name = ko.observable();
                this.password = ko.observableArray();
                this.password2 = ko.observableArray();
                this.email = ko.observable();
                this.isUserNameUnique = ko.observable(false);
                this.isUserEmailUnique = ko.observable(false);
                this.name.subscribe(function (s) {
                    _this.isUserNameUnique(false);
                    clearTimeout(_this.__hdlCheckIfExistsName);
                    if (!s)
                        return;
                    _this.__hdlCheckIfExistsName = setTimeout(function () {
                        _this.verifyUserName();
                    }, 500);
                });
                this.email.subscribe(function (s) {
                    _this.isUserEmailUnique(false);
                    clearTimeout(_this.__hdlCheckIfExistsEmail);
                    if (!s)
                        return;
                    if (!isValidEmail(s)) {
                        return;
                    }
                    _this.__hdlCheckIfExistsEmail = setTimeout(function () {
                        _this.verifyUserEmail();
                    }, 500);
                });
            }
            /**
             * Submit data
             */
            Model.prototype.submit = function () {
                if (!this.checkForm()) {
                    return false;
                }
                var data = {
                    name: this.name(),
                    email: this.email()
                };
                var request = {
                    type: 'post',
                    url: host + 'rest/user',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        success("Votre compte a été créé. Veuillez patientez durant que nous vous redirigeons vers la page d'accueil... ", "Welcome !", { showConfirmButton: false });
                        setTimeout(function () {
                            document.location.href = host + 'login';
                        }, 2000);
                    }
                    else {
                        error("Holy s**t ! Une erreur est apparue durant la création de votre compte :(. Essayez de recommencer dans quelques minutes !");
                    }
                });
                return false;
            };
            Model.prototype.prev = function () {
                $('#UserForm').formslider('prev');
            };
            /**
             * Controle email seized
             */
            Model.prototype.checkEmail = function () {
                if (!(this.email() || '').trim()) {
                    toast("Il manque une adresse email pour votre compte");
                    return false;
                }
                if (!isValidEmail(this.email())) {
                    toast("Malheureusement, cette adresse ne semble pas valide. Êtes-vous sûr de l'avoir bien saisie ?");
                    return false;
                }
                if (!this.isUserEmailUnique()) {
                    toast("Malheureusement, cette adresse email est déjà utilisée");
                    return false;
                }
                return true;
            };
            /**
             * Controle name seized
             */
            Model.prototype.checkName = function () {
                if (!(this.name() || '').trim()) {
                    toast("Renseignez un nom utilisateur pour votre compte");
                    return false;
                }
                if (!this.isUserNameUnique()) {
                    toast("Malheureusement, ce nom est déjà pris");
                    return false;
                }
                return true;
            };
            Model.prototype.checkForm = function () {
                if (!this.checkEmail()) {
                    $('#UserForm').formslider('animate:0');
                    return false;
                }
                if (!this.checkName()) {
                    $('#UserForm').formslider('animate:1');
                    return false;
                }
                return true;
            };
            Model.prototype.next = function () {
                if (this.checkForm()) {
                    $('#UserForm').formslider('next');
                    return true;
                }
                return false;
            };
            /**
             * check if user name is already used into database
             */
            Model.prototype.verifyUserName = function () {
                var _this = this;
                this.isUserNameUnique(false);
                user.isNameUnique(this.name(), function (b) {
                    _this.isUserNameUnique(b);
                });
                return false;
            };
            /**
             * check if user email is already used into database
             */
            Model.prototype.verifyUserEmail = function () {
                var _this = this;
                user.isEmailUnique(this.email(), function (b) {
                    _this.isUserEmailUnique(b);
                });
                return false;
            };
            return Model;
        })();
        window.model = new Model();
        ko.applyBindings(window.model, $('#app')[0]);
    })(startup = startupfollows.startup || (startupfollows.startup = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=sign-up.js.map