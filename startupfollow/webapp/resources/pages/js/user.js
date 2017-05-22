var startupfollows;
(function (startupfollows) {
    var startup;
    (function (startup) {
        var UserModel = (function () {
            function UserModel() {
                var _this = this;
                this.data = ko.observable();
                this.isReady = ko.observable(false);
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
                var subscriptions = this.data().subscriptions || [];
                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].startup_uid == uid) {
                        return true;
                    }
                }
                return false;
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
            UserModel.prototype.unlog = function (callback) {
                var request = {
                    type: 'delete',
                    url: host + 'rest/user/auth',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        document.location.href = host + 'login';
                    }
                    if (typeof (callback) == "function") {
                        callback.apply(this, arguments);
                    }
                });
            };
            return UserModel;
        })();
        window.user = new UserModel();
    })(startup = startupfollows.startup || (startupfollows.startup = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=user.js.map