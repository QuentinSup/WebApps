var startupfollows;
(function (startupfollows) {
    var startupEdit;
    (function (startupEdit) {
        var StartupStoryForm = (function () {
            function StartupStoryForm() {
                this.startupUID = ko.observable();
                this.uid = ko.observable();
                this.shortLine = ko.observable();
                this.text = ko.observable();
            }
            StartupStoryForm.prototype.new = function (startup_uid) {
                this.shortLine('');
                this.text('');
                this.uid('');
                this.startupUID(startup_uid);
            };
            StartupStoryForm.prototype.fill = function (json) {
                this.shortLine(json.shortLine);
                this.text(json.text);
                this.uid(json.uid);
                this.startupUID(json.startup_uid);
            };
            StartupStoryForm.prototype.cancel = function () {
                $('#stories').formslider('animate:first');
            };
            StartupStoryForm.prototype.submit = function () {
                var _this = this;
                var data = {
                    shortLine: this.shortLine(),
                    text: $("#form-text").html()
                };
                var request;
                if (this.uid()) {
                    request = {
                        type: 'put',
                        url: host + 'rest/startup/' + this.startupUID() + '/story/' + this.uid(),
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json'
                    };
                }
                else {
                    request = {
                        type: 'post',
                        url: host + 'rest/startup/' + this.startupUID() + '/story',
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json'
                    };
                }
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.cancel();
                        window.model.listStories();
                    }
                });
                return false;
            };
            return StartupStoryForm;
        })();
        var StartupForm = (function () {
            function StartupForm() {
                var _this = this;
                this.uid = ko.observable();
                this.name = ko.observable();
                this.punchLine = ko.observable();
                this.email = ko.observable();
                this.firstName = ko.observable();
                this.lastName = ko.observable();
                this.image = ko.observable();
                this.website = ko.observable();
                this.twitter = ko.observable();
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
            StartupForm.prototype.checkIfExists = function (name) {
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
            StartupForm.prototype.addMember = function () {
                this.members.push({
                    uid: '',
                    firstName: ko.observable(),
                    lastName: ko.observable(),
                    email: ko.observable()
                });
            };
            StartupForm.prototype.fill = function (data) {
                var _this = this;
                this.uid(data.uid);
                this.name(data.name);
                this.email(data.email);
                this.punchLine(data.punchLine);
                this.firstName(data.firstName);
                this.lastName(data.lastName);
                this.image(data.image);
                this.website(data.link_website);
                this.twitter(data.link_twitter);
                this.facebook(data.link_facebook);
                this.members([]);
                $.each(data.members, function (k, v) {
                    var member = {
                        uid: ko.observable(),
                        firstName: ko.observable(),
                        lastName: ko.observable(),
                        email: ko.observable()
                    };
                    member.uid(v.uid);
                    member.firstName(v.firstName);
                    member.lastName(v.lastName);
                    member.email(v.email);
                    _this.members.push(member);
                });
            };
            /**
             * Submit data
             */
            StartupForm.prototype.submit = function () {
                var data = {
                    name: this.name(),
                    email: this.email(),
                    punchLine: this.punchLine(),
                    image: this.image(),
                    link_twitter: this.twitter(),
                    link_website: this.website(),
                    link_facebook: this.facebook(),
                    members: [{
                            firstName: this.firstName(),
                            lastName: this.lastName(),
                            email: this.email(),
                            founder: 1
                        }]
                };
                $.each(this.members(), function (k, v) {
                    data.members.push({
                        uid: v.uid(),
                        firstName: v.firstName(),
                        lastName: v.lastName(),
                        email: v.email()
                    });
                });
                var request = {
                    type: 'put',
                    url: host + 'rest/startup/' + this.uid(),
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status != 200) {
                        alert(status);
                    }
                });
                return false;
            };
            return StartupForm;
        })();
        var Model = (function () {
            function Model() {
                var _this = this;
                this.index = ko.observable(1);
                this.startup = ko.observable();
                this.stories = ko.observableArray();
                this.form = new StartupForm();
                this.storyform = new StartupStoryForm();
                this.startup.subscribe(function (s) {
                    _this.form.fill(s);
                    _this.storyform.new(s.uid);
                    _this.listStories();
                });
                this.index.subscribe(function (i) {
                    $('#sections').formslider('animate:' + (i - 1));
                });
            }
            Model.prototype.load = function (name) {
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
            Model.prototype.newStory = function () {
                this.storyform.new(this.startup().uid);
                $('#stories').formslider('animate:1');
            };
            Model.prototype.loadStory = function (uid) {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.storyform.fill(response.responseJSON);
                        $('#stories').formslider('animate:1');
                    }
                });
            };
            Model.prototype.editStory = function (uid) {
                this.loadStory(uid);
            };
            Model.prototype.showSection = function (i) {
                this.index(i);
            };
            Model.prototype.listStories = function () {
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
            Model.prototype.initMCE = function () {
                tinymce.init({
                    setup: function (ed) {
                    },
                    selector: "#form-text",
                    images_upload_url: host + 'api/image',
                    menubar: false,
                    paste_as_text: false,
                    paste_data_images: true,
                    theme: 'inlite',
                    contextmenu: "paste pastetext | undo redo | quicklink quickimage",
                    browser_spellcheck: true,
                    insert_toolbar: 'quickimage',
                    selection_toolbar: 'bold italic underline strikethrough | quicklink blockquote code',
                    inline: true,
                    plugins: [
                        "advlist autolink link image lists charmap print hr anchor pagebreak",
                        "searchreplace wordcount visualblocks visualchars code media nonbreaking",
                        "save contextmenu directionality emoticons template paste textcolor"
                    ]
                });
            };
            return Model;
        })();
        var model = new Model();
        window.model = model;
        ko.applyBindings(model, $('#app')[0]);
        model.initMCE();
    })(startupEdit = startupfollows.startupEdit || (startupfollows.startupEdit = {}));
})(startupfollows || (startupfollows = {}));
//# sourceMappingURL=startupedit.js.map