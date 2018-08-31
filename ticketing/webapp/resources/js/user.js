var ticketing;
(function (ticketing) {
    var UserModel = /** @class */ (function () {
        function UserModel(data) {
            var _this = this;
            this.data = ko.observable();
            this.isReady = ko.observable(false);
            this.__jqxrNameUnique = null;
            this.__jqxrEmailUnique = null;
            this.data(data);
            this.data.subscribe(function (v) {
                if (v) {
                    _this.isReady(true);
                }
            });
        }
        UserModel.prototype.ready = function (fn) {
            var _this = this;
            if (this.isReady()) {
                fn.call(this, this, this.data());
                return;
            }
            var subscription = this.isReady.subscribe(function (b) {
                if (b) {
                    subscription.dispose();
                    _this.ready(fn);
                }
            });
        };
        UserModel.prototype.load = function (id) {
            var _this = this;
            if (id === void 0) { id = null; }
            var request = {
                type: 'get',
                url: host + UserModel.URI + (id || ''),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 200) {
                    _this.data(response.responseJSON);
                }
                else {
                    throw "Utilisateur introuvable";
                }
            });
        };
        /**
         * Log out user
         */
        UserModel.prototype.logout = function (callback) {
            var request = {
                type: 'delete',
                url: host + 'rest/user/auth',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 204) {
                    document.location.href = host + 'login';
                }
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
        };
        UserModel.prototype.isNameUnique = function (name, callback) {
            var _this = this;
            var request = {
                type: 'get',
                url: host + 'rest/user/username/' + name + (this.data() ? '?ref=' + this.data().uid : ''),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            if (this.__jqxrNameUnique) {
                this.__jqxrNameUnique.abort();
                this.__jqxrNameUnique = null;
            }
            $.ajax(request).complete(function (response, status) {
                if (typeof (callback) == "function") {
                    callback.call(_this, response.status == 200);
                }
            });
        };
        /**
         * check if user email is already used into database
         */
        UserModel.prototype.isEmailUnique = function (email, callback) {
            var _this = this;
            var request = {
                type: 'get',
                url: host + 'rest/user/email/' + email + (this.data() ? '?ref=' + this.data().uid : ''),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            if (this.__jqxrEmailUnique) {
                this.__jqxrEmailUnique.abort();
                this.__jqxrEmailUnique = null;
            }
            $.ajax(request).complete(function (response, status) {
                if (typeof (callback) == "function") {
                    callback.call(_this, response.status == 200);
                }
            });
        };
        /**
         * Update user data
         */
        UserModel.prototype.update = function (data, callback) {
            var request = {
                type: 'put',
                data: JSON.stringify(data),
                url: host + 'rest/user/' + this.data().uid,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
        };
        /**
         * Calculate password strength
         */
        UserModel.calculatePasswordStrength = function (p) {
            if (p.length > 4) {
                return 50;
            }
            return 0;
        };
        /**
         * Return true if password strength is enought
         */
        UserModel.isPasswordStrengthOK = function (p) {
            return UserModel.calculatePasswordStrength(p) >= 50;
        };
        /**
         * Update user password
         */
        UserModel.prototype.changePassword = function (password, callback) {
            if (!UserModel.isPasswordStrengthOK(password)) {
                return false;
            }
            var request = {
                type: 'put',
                data: JSON.stringify({ password: password }),
                url: host + 'rest/user/' + this.data().uid + '/password',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
            return true;
        };
        /**
         * Search users
         */
        UserModel.prototype.search = function (data, callback) {
            var request = {
                type: 'get',
                data: data,
                url: host + 'rest/user/search',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
        };
        UserModel.URI = 'rest/user/';
        return UserModel;
    }());
    ticketing.UserModel = UserModel;
    window.user = new UserModel();
})(ticketing || (ticketing = {}));
