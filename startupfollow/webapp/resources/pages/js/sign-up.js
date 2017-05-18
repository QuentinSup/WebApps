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
                    if (!s)
                        return;
                    clearTimeout(_this.__hdlCheckIfExistsName);
                    _this.__hdlCheckIfExistsName = setTimeout(function () {
                        _this.verifyUserName();
                    }, 500);
                });
                this.email.subscribe(function (s) {
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
                    }
                    else {
                        alert(status);
                    }
                });
                return false;
            };
            Model.prototype.prev = function () {
                $('#UserForm').unslider('prev');
            };
            Model.prototype.next = function () {
                $('#UserForm').unslider('next');
            };
            /**
             * check if user name is already used into database
             */
            Model.prototype.verifyUserName = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/user/username/' + this.name(),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                this.isUserNameUnique(false);
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.isUserNameUnique(true);
                    }
                    else {
                        alert(status);
                    }
                });
                return false;
            };
            /**
             * check if user email is already used into database
             */
            Model.prototype.verifyUserEmail = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/user/email/' + this.email(),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                this.isUserEmailUnique(false);
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.isUserEmailUnique(true);
                    }
                    else {
                        alert(status);
                    }
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