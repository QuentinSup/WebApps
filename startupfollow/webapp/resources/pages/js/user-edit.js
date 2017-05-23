var startupfollows;
(function (startupfollows) {
    var startupEdit;
    (function (startupEdit) {
        var UserForm = (function () {
            function UserForm() {
                var _this = this;
                this.uid = ko.observable();
                this.name = ko.observable();
                this.email = ko.observable();
                this.firstName = ko.observable();
                this.lastName = ko.observable();
                this.password = ko.observableArray();
                this.password2 = ko.observableArray();
                this.image = ko.observable();
                this.website = ko.observable();
                this.twitter = ko.observable();
                this.facebook = ko.observable();
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
             * check if user name is already used into database
             */
            UserForm.prototype.verifyUserName = function () {
                var _this = this;
                this.isUserNameUnique(false);
                user.isNameUnique(this.name(), function (b) {
                    _this.isUserNameUnique(b);
                    if (b) {
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
                user.isEmailUnique(this.email(), function (b) {
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
             * Submit data
             */
            UserForm.prototype.submit = function () {
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
            return UserForm;
        })();
        var Model = (function () {
            function Model() {
                var _this = this;
                this.index = ko.observable(1);
                this.form = new UserForm();
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
    })(startupEdit = startupfollows.startupEdit || (startupfollows.startupEdit = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=user-edit.js.map