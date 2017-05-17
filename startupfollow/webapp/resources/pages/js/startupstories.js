var startupfollows;
(function (startupfollows) {
    var startupEdit;
    (function (startupEdit) {
        var Model = (function () {
            function Model() {
                var _this = this;
                this.stories = ko.observableArray();
                this.startup = ko.observable();
                this.startup.subscribe(function (s) {
                    _this.list();
                });
            }
            Model.prototype.find = function (name) {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + name,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.startup(response.responseJSON);
                    }
                });
            };
            Model.prototype.list = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/all',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.stories(response.responseJSON);
                    }
                });
            };
            return Model;
        })();
        window.model = new Model();
        ko.applyBindings(window.model, $('#app')[0]);
    })(startupEdit = startupfollows.startupEdit || (startupfollows.startupEdit = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=startupstories.js.map