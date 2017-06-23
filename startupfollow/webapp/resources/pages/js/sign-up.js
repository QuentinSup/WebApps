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
                    if (!s)
                        return;
                    clearTimeout(_this.__hdlCheckIfExistsName);
                    _this.__hdlCheckIfExistsName = setTimeout(function () {
                        _this.verifyUserName();
                    }, 500);
                });
                this.email.subscribe(function (s) {
                    _this.isUserEmailUnique(false);
                    if (!s)
                        return;
                    clearTimeout(_this.__hdlCheckIfExistsEmail);
                    _this.__hdlCheckIfExistsEmail = setTimeout(function () {
                        _this.verifyUserEmail();
                    }, 500);
                });
            }
            /**
             * Submit data
             */
            Model.prototype.submit = function () {
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
                        error("Holy s**t ! Une erreur est apparue durant la création de votre compte :(<br />Essayez de recommencer dans quelques minutes !");
                    }
                });
                return false;
            };
            Model.prototype.prev = function () {
                $('#UserForm').formslider('prev');
            };
            Model.prototype.next = function () {
                $('#UserForm').formslider('next');
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