var startupfollows;
(function (startupfollows) {
    var startup;
    (function (startup) {
        var Model = (function () {
            function Model() {
                this.name = ko.observable();
                this.password = ko.observable();
                this.redirectTo = ko.observable();
            }
            Model.prototype.login = function () {
                var _this = this;
                var data = {
                    name: this.name(),
                    password: this.password()
                };
                var request = {
                    type: 'post',
                    url: host + 'rest/user/auth',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        document.location.href = host + _this.redirectTo() || '';
                    }
                });
            };
            return Model;
        })();
        window.model = new Model();
        ko.applyBindings(window.model, $('#app')[0]);
    })(startup = startupfollows.startup || (startupfollows.startup = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=log-in.js.map