var colaunch;
(function (colaunch) {
    var UserForm = (function () {
        function UserForm(parent) {
            var _this = this;
            this.uid = ko.observable();
            this.name = ko.observable();
            this.email = ko.observable();
            this.firstName = ko.observable();
            this.lastName = ko.observable();
            this.password1 = ko.observable();
            this.password2 = ko.observable();
            this.image = ko.observable();
            this.website = ko.observable();
            this.twitter = ko.observable();
            this.facebook = ko.observable();
            this.isCheckingNameUnique = ko.observable(false);
            this.isCheckingEmailUnique = ko.observable(false);
            this.isEmailValid = ko.observable(false);
            this.isUserNameUnique = ko.observable(false);
            this.isUserEmailUnique = ko.observable(false);
            this.parent = parent;
            this.name.subscribe(function (s) {
                clearTimeout(_this.__hdlCheckIfExistsName);
                if (s == user.data().name) {
                    _this.isUserNameUnique(true);
                    return;
                }
                _this.isUserNameUnique(false);
                if (!s)
                    return;
                _this.__hdlCheckIfExistsName = setTimeout(function () {
                    _this.verifyUserName();
                }, 500);
            });
            this.email.subscribe(function (s) {
                clearTimeout(_this.__hdlCheckIfExistsEmail);
                _this.isEmailValid(isValidEmail(s));
                if (s == user.data().email) {
                    _this.isUserEmailUnique(true);
                    return;
                }
                _this.isUserEmailUnique(false);
                if (!s)
                    return;
                if (_this.isEmailValid()) {
                    _this.__hdlCheckIfExistsEmail = setTimeout(function () {
                        _this.verifyUserEmail();
                    }, 500);
                }
            });
            this.isPassword1Valid = ko.computed(function () {
                var v = _this.password1() || '';
                return user.isPasswordStrengthOK(v);
            }).extend({ throttle: 100 });
            this.isPassword2Valid = ko.computed(function () {
                return _this.isPassword1Valid() && _this.password2() == _this.password1();
            }).extend({ throttle: 100 });
        }
        /**
         * check if user name is already used into database
         */
        UserForm.prototype.verifyUserName = function () {
            var _this = this;
            this.isCheckingNameUnique(true);
            this.isUserNameUnique(false);
            user.isNameUnique(this.name(), function (b) {
                _this.isCheckingNameUnique(false);
                _this.isUserNameUnique(b);
                if (b && _this.name().toLowerCase() != user.data().name.toLowerCase()) {
                    toast("Votre nouveau nom vous va à ravir ;)", { id: 'usernameunique' });
                }
            });
            return false;
        };
        /**
         * check if user email is already used into database
         */
        UserForm.prototype.verifyUserEmail = function () {
            var _this = this;
            this.isCheckingEmailUnique(true);
            this.isUserEmailUnique(false);
            user.isEmailUnique(this.email(), function (b) {
                _this.isCheckingEmailUnique(false);
                _this.isUserEmailUnique(b);
            });
            return false;
        };
        UserForm.prototype.fill = function (data) {
            this.uid(data.uid);
            this.name(data.name);
            this.email(data.email);
            this.firstName(data.firstName);
            this.lastName(data.lastName);
            this.image(data.image);
            this.website(data.link_website);
            this.twitter(data.link_twitter);
            this.facebook(data.link_facebook);
        };
        /**
         * Check form data
         */
        UserForm.prototype.checkForm = function () {
            if (!(this.name() || '').trim()) {
                toast("N'oubliez pas d'indiquer votre nom de connexion !");
                this.parent.showSection(1);
                return false;
            }
            if (!(this.email() || '').trim()) {
                toast("Votre email est nécessaire !");
                this.parent.showSection(1);
                return false;
            }
            if (!this.isEmailValid()) {
                toast("Votre email n'est pas valide !");
                this.parent.showSection(1);
                return false;
            }
            if (!this.isUserEmailUnique()) {
                toast("Cet email est déjà utilisé par un autre compte !");
                this.parent.showSection(1);
                return false;
            }
            if (!this.isUserNameUnique()) {
                toast("Cet identifiant est déjà utilisé par un autre compte !");
                this.parent.showSection(1);
                return false;
            }
            return true;
        };
        /**
         * Submit data
         */
        UserForm.prototype.submit = function () {
            if (!this.checkForm()) {
                return false;
            }
            var data = {
                name: this.name(),
                email: this.email(),
                firstName: this.firstName(),
                lastName: this.lastName(),
                image: this.image(),
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook()
            };
            user.update(data, function (response, status) {
                if (response.status != 200) {
                    error("Mince, une erreur est apparue est nous n'avons pas pu mettre à jour vos informations :(");
                }
                else {
                    success("Well done, vos informations sont à jour !");
                }
            });
            return false;
        };
        /**
         * Submit data
         */
        UserForm.prototype.passwordSubmit = function () {
            if (!this.isPassword1Valid() || !this.isPassword2Valid()) {
                return false;
            }
            user.changePassword(this.password1(), function (response, status) {
                if (response.status != 200) {
                    error("Un problème est apparu durant le changement de votre mot de passe :(");
                }
                else {
                    success("Well done, vous allez recevoir une confirmation par email avec votre nouveau mot de passe !");
                }
            });
            return false;
        };
        return UserForm;
    })();
    var Model = (function () {
        function Model() {
            var _this = this;
            this.index = ko.observable(1);
            this.form = new UserForm(this);
            user.ready(function (user, data) {
                _this.form.fill(data);
            });
            this.index.subscribe(function (i) {
                $('#sections').formslider('animate:' + (i - 1));
            });
        }
        Model.prototype.showSection = function (i) {
            this.index(i);
        };
        return Model;
    })();
    var model = new Model();
    window.model = model;
    ko.applyBindings(model, $('#app')[0]);
})(colaunch || (colaunch = {}));
//# sourceMappingURL=user-edit.js.map