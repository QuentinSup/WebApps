var startupfollows;
(function (startupfollows) {
    var main;
    (function (main) {
        var StartupFormRequest = (function () {
            function StartupFormRequest() {
                this.name = ko.observable();
                this.email = ko.observable();
            }
            /**
             * Submit data
             */
            StartupFormRequest.prototype.submit = function () {
                var data = {
                    name: this.name(),
                    email: this.email()
                };
                var request = {
                    type: 'post',
                    url: 'rest/request',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    console.log(status, response);
                });
                return false;
            };
            return StartupFormRequest;
        })();
        var Model = (function () {
            function Model() {
                var _this = this;
                this.P = ko.observableArray(projects);
                this.R = ko.observableArray();
                this.searchValue = ko.observable();
                this.startupRequestForm = new StartupFormRequest();
                // search function
                this.searchValue.subscribe(function (str) {
                    _this.R($.map(_this.P(), function (v) {
                        return (str && v.name.toLowerCase().startsWith(str.toLowerCase())) ? v : null;
                    }));
                });
                this.getAllProjects();
            }
            /**
             * retourne la liste des projets
             */
            Model.prototype.getAllProjects = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: 'rest/startup/all',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        var projects = [];
                        $.each(response.responseJSON, function (k, v) {
                            projects.push(JSON.parse(v.data));
                        });
                        _this.P(projects);
                    }
                });
            };
            return Model;
        })();
        ko.applyBindings(new Model(), $('#app')[0]);
    })(main = startupfollows.main || (startupfollows.main = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=main.js.map