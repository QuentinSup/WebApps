var startupfollows;
(function (startupfollows) {
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
        }
        return Model;
    })();
    ko.applyBindings(new Model(), $('#app')[0]);
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=main.js.map