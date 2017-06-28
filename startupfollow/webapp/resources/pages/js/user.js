var colaunch;
(function (colaunch) {
    var UserModel = (function () {
        function UserModel() {
            var _this = this;
            this.data = ko.observable();
            this.isReady = ko.observable(false);
            this.__jqxrNameUnique = null;
            this.__jqxrEmailUnique = null;
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
        UserModel.prototype.load = function () {
            var _this = this;
            var request = {
                type: 'get',
                url: host + 'rest/user/',
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
        UserModel.prototype.isFollowingStartup = function (uid) {
            if (!this.data())
                return false;
            var subscriptions = this.data().subscriptions || [];
            return !!subscriptions.findBy('startup_uid', uid);
        };
        UserModel.prototype.canManageStartup = function (uid) {
            if (!this.data())
                return false;
            var teams = this.data().teams || [];
            return !!teams.findBy('uid', uid);
        };
        UserModel.prototype.likeStory = function (uid, callback) {
            var request = {
                type: 'post',
                url: host + 'rest/user/story/' + uid + '/like',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 204) {
                }
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
        };
        UserModel.prototype.follow = function (uid, callback) {
            var request = {
                type: 'post',
                url: host + 'rest/startup/' + uid + '/subscribe',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 200) {
                }
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
                }
            });
        };
        UserModel.prototype.unfollow = function (uid, callback) {
            var request = {
                type: 'delete',
                url: host + 'rest/startup/' + uid + '/subscribe',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 200) {
                }
                if (typeof (callback) == "function") {
                    callback.apply(this, arguments);
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
                url: host + 'rest/user/username/' + name,
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
                url: host + 'rest/user/email/' + email,
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
                url: host + 'rest/user',
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
        return UserModel;
    })();
    window.user = new UserModel();
})(colaunch || (colaunch = {}));
//# sourceMappingURL=user.js.map