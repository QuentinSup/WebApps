var colaunch;
(function (colaunch) {
    var StartupFormRequest = (function () {
        function StartupFormRequest() {
            this.name = ko.observable();
            this.email = ko.observable();
        }
        /**
         * Submit data
         */
        StartupFormRequest.prototype.submit = function () {
            var _this = this;
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
                if (response.status == 201) {
                    success("Un email a été envoyé au porteur du projet '" + _this.name() + "' ;)", "Super !");
                    _this.name('');
                    _this.email('');
                }
                else {
                    error("Holy s**t ! Une erreur est apparue durant le traitement de la requête. Essayez de recommencer dans quelques minutes (on sait jamais) !");
                }
            });
            return false;
        };
        return StartupFormRequest;
    })();
    var Model = (function () {
        function Model() {
            var _this = this;
            this.P = ko.observableArray();
            this.R = ko.observableArray();
            this.searchValue = ko.observable();
            this.startupRequestForm = new StartupFormRequest();
            this.isReady = ko.observable();
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
                url: 'rest/project/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 200) {
                    var projects = [];
                    $.each(response.responseJSON, function (k, v) {
                        projects.push(v);
                    });
                    _this.P(projects);
                }
            });
        };
        return Model;
    })();
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
})(colaunch || (colaunch = {}));
//# sourceMappingURL=main.js.map