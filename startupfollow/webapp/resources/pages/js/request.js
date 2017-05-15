var startupfollows;
(function (startupfollows) {
    var request;
    (function (request_1) {
        var StartupAddForm = (function () {
            function StartupAddForm() {
                var _this = this;
                this.name = ko.observable();
                this.punchLine = ko.observable();
                this.email = ko.observable();
                this.firstName = ko.observable();
                this.lastName = ko.observable();
                this.image = ko.observable();
                this.website = ko.observable('http://');
                this.twitter = ko.observable('@');
                this.facebook = ko.observable();
                this.members = ko.observableArray();
                this.nameExists = ko.observable(true);
                this.addMember();
                this.name.subscribe(function (v) {
                    _this.nameExists(true);
                    if (!v)
                        return;
                    clearTimeout(_this.__hdlCheckIfExists);
                    _this.__hdlCheckIfExists = setTimeout(function () {
                        _this.checkIfExists(v);
                    }, 500);
                });
            }
            StartupAddForm.prototype.checkIfExists = function (name) {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + name,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    _this.nameExists(response.status == 200);
                });
            };
            StartupAddForm.prototype.prev = function () {
                $('#StartupAddForm').unslider('prev');
            };
            StartupAddForm.prototype.next = function () {
                $('#StartupAddForm').unslider('next');
            };
            StartupAddForm.prototype.addMember = function () {
                this.members.push({
                    firstName: ko.observable(),
                    lastName: ko.observable(),
                    email: ko.observable()
                });
            };
            /**
             * Submit data
             */
            StartupAddForm.prototype.submit = function () {
                var data = {
                    name: this.name(),
                    punchLine: this.punchLine(),
                    description: '',
                    image: this.image(),
                    links: [
                        { rel: 'twitter', value: this.twitter(), href: 'https://twitter.com/' + this.twitter() },
                        { rel: 'facebook', value: this.facebook(), href: 'https://www.facebook.com/' + this.facebook() + '/' },
                        { rel: 'website', value: this.website(), href: this.website() }
                    ],
                    founders: [{
                            firstName: this.firstName(),
                            lastName: this.lastName(),
                            email: this.email(),
                            links: []
                        }],
                    members: []
                };
                $.each(this.members(), function (k, v) {
                    data.members.push({
                        firstName: v.firstName(),
                        lastName: v.lastName(),
                        email: v.email()
                    });
                });
                var request = {
                    type: 'post',
                    url: host + 'rest/startup',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    console.log(status, response);
                });
                return false;
            };
            return StartupAddForm;
        })();
        request_1.StartupAddForm = StartupAddForm;
        var Model = (function () {
            function Model() {
                this.form = new StartupAddForm();
            }
            return Model;
        })();
        request_1.Model = Model;
        window.model = new Model();
        ko.applyBindings(window.model, $('#app')[0]);
    })(request = startupfollows.request || (startupfollows.request = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=request.js.map