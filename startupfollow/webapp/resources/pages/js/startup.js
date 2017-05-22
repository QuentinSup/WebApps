var startupfollows;
(function (startupfollows) {
    var startup;
    (function (startup) {
        var Model = (function () {
            function Model() {
                var _this = this;
                this.data = ko.observable();
                this.stories = ko.observableArray();
                this.isFollowedByUser = ko.observable(false);
                this.data.subscribe(function (s) {
                    _this.listStories();
                    user.ready(function (user) {
                        if (user.isFollowingStartup(s.uid)) {
                            _this.isFollowedByUser(true);
                        }
                    });
                });
            }
            Model.prototype.find = function (id) {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + id,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.data(response.responseJSON);
                    }
                    else {
                        throw "Startup introuvable";
                    }
                    $(document).trigger('unsyncready');
                });
            };
            Model.prototype.listStories = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.data().uid + '/story/all',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.stories(ko.mapping.fromJS(response.responseJSON)());
                    }
                });
            };
            Model.prototype.addStoryLike = function (uid, index) {
                var _this = this;
                user.likeStory(uid, function (response, status) {
                    if (response.status == 204) {
                        _this.stories()[index].numberOfLikes((_this.stories()[index].numberOfLikes() * 1) + 1);
                    }
                });
            };
            Model.prototype.follow = function () {
                var _this = this;
                user.follow(this.data().uid, function (response, status) {
                    if (response.status == 204) {
                        _this.isFollowedByUser(true);
                    }
                });
            };
            Model.prototype.unfollow = function () {
                var _this = this;
                user.unfollow(this.data().uid, function (response, status) {
                    if (response.status == 204) {
                        _this.isFollowedByUser(false);
                    }
                });
            };
            return Model;
        })();
        window.model = new Model();
        ko.applyBindings(window.model, $('#app')[0]);
    })(startup = startupfollows.startup || (startupfollows.startup = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=startup.js.map