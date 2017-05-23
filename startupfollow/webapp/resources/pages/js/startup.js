var startupfollows;
(function (startupfollows) {
    var startup;
    (function (startup) {
        var Model = (function () {
            function Model() {
                var _this = this;
                this.data = ko.observable();
                this.stories = ko.observableArray();
                this.events = ko.observableArray();
                this.isFollowedByUser = ko.observable(false);
                this.data.subscribe(function (s) {
                    _this.listStories();
                    _this.listEvents();
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
            Model.prototype.listEvents = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.data().uid + '/event/all',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.events(ko.mapping.fromJS(response.responseJSON)());
                    }
                });
            };
            Model.prototype.addStoryLike = function (uid, index) {
                var _this = this;
                user.likeStory(uid, function (response, status) {
                    if (response.status == 204) {
                        _this.stories()[index].numberOfLikes((_this.stories()[index].numberOfLikes() * 1) + 1);
                    }
                    else {
                        error("Mince, une erreur est apparue et nous n'avons pas pu vous permettre d'aimer cette news ;(");
                    }
                });
            };
            Model.prototype.follow = function () {
                var _this = this;
                user.follow(this.data().uid, function (response, status) {
                    if (response.status == 204) {
                        _this.isFollowedByUser(true);
                        toast("Vous suivez désormais " + _this.data().name, { title: 'Félicitations!' });
                    }
                    else {
                        error("Mince, une erreur est apparue et nous n'avons pas pu vous permettre de suivre cette startup ;(");
                    }
                });
            };
            Model.prototype.unfollow = function () {
                var _this = this;
                user.unfollow(this.data().uid, function (response, status) {
                    if (response.status == 204) {
                        _this.isFollowedByUser(false);
                        toast("Vous ne suivez plus " + _this.data().name, { title: 'Dommage!' });
                    }
                    else {
                        error("Mince, une erreur est apparue et nous n'avons pas pu vous désinscrire de cette startup ;(");
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