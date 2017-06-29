var colaunch;
(function (colaunch) {
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
                this.text.notifySubscribers();
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
            /**
             * Submit story form
             */
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
                        if (!_this.uid()) {
                            success("Well done ! Vos fans seront prochainement informés de votre nouvelle !");
                        }
                        window.model.listStories();
                    }
                    else {
                        error("Mince, une erreur est apparue durant la sauvegarde de votre nouvelle :(");
                    }
                });
                return false;
            };
            return StartupStoryForm;
        })();
        var StartupForm = (function () {
            function StartupForm(parent) {
                var _this = this;
                this.uid = ko.observable();
                this.name = ko.observable();
                this.month = ko.observable();
                this.year = ko.observable();
                this.punchLine = ko.observable();
                this.email = ko.observable();
                this.image = ko.observable();
                this.website = ko.observable();
                this.twitter = ko.observable();
                this.facebook = ko.observable();
                this.members = ko.observableArray();
                this.nameExists = ko.observable(true);
                this.isEmailValid = ko.observable(false);
                this.isCheckingNameExists = ko.observable(false);
                this.parent = parent;
                // Check existing name
                this.name.subscribe(function (v) {
                    _this.nameExists(true);
                    clearTimeout(_this.__hdlCheckIfNameExists);
                    if (!v)
                        return;
                    _this.__hdlCheckIfNameExists = setTimeout(function () {
                        _this.checkIfExists(v);
                    }, 500);
                });
                // Autovalidate email
                this.email.subscribe(function (v) {
                    _this.isEmailValid(v && isValidEmail(v));
                });
                this.isValidDate = ko.computed(function () {
                    if (!(_this.month() || '').trim()) {
                        return false;
                    }
                    var month = _this.month() * 1;
                    if (!(month >= 1 && month <= 12)) {
                        return false;
                    }
                    if (!(_this.year() || '').trim()) {
                        return false;
                    }
                    var year = _this.year();
                    if (year.length != 4 || isNaN(year)) {
                        return false;
                    }
                    var now = new Date();
                    year = year * 1;
                    if (year < now.getFullYear() - 50 || year > now.getFullYear()) {
                        toast("Etes-vous certain de l'année ?");
                        return false;
                    }
                    if (year == now.getFullYear() && month > now.getMonth() - 1) {
                        toast("Etes-vous certain du mois ?");
                        return false;
                    }
                    return true;
                }).extend({ throttle: 100 });
            }
            /**
             * Check form
             */
            StartupForm.prototype.checkForm = function () {
                if (!(this.name() || '').trim()) {
                    toast("Le nom ne doit pas être vide !");
                    this.parent.showSection(1);
                    return false;
                }
                if (this.nameExists()) {
                    toast("Ce nom est déjà utilisé !");
                    this.parent.showSection(1);
                    return false;
                }
                if (!this.isEmailValid()) {
                    toast("L'adresse email n'est pas valide !");
                    this.parent.showSection(1);
                    return false;
                }
                if (!this.isValidDate()) {
                    toast("La date de début du projet n'est pas valide !");
                    this.parent.showSection(1);
                    return false;
                }
                return true;
            };
            StartupForm.prototype.checkIfExists = function (name) {
                var _this = this;
                this.isCheckingNameExists(true);
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/exists/' + name + '?ref=' + this.uid(),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    _this.isCheckingNameExists(false);
                    _this.nameExists(response.status == 200);
                });
            };
            StartupForm.prototype.createMember = function () {
                var member = {
                    uid: ko.observable(),
                    role: ko.observable(),
                    email: ko.observable(),
                    user: ko.observable(),
                    invitationSentAt: ko.observable(),
                    joined: ko.observable(false),
                    deleted: ko.observable(false)
                };
                return member;
            };
            StartupForm.prototype.addMember = function () {
                var _this = this;
                var member = this.createMember();
                this.members.push(member);
                member.email.subscribe(function (s) {
                    clearTimeout(_this.__hdlCheckIfEmailExists);
                    if (s) {
                        _this.__hdlCheckIfEmailExists = setTimeout(function () {
                            if (!isValidEmail(s)) {
                                toast("Merci de renseigner une adresse email valide !");
                                member.email('');
                                return;
                            }
                            if (_this.isCurrentMember(s, member)) {
                                member.email('');
                                toast("Ce membre est déjà présent dans la liste");
                                return;
                            }
                            user.search({ email: s }, function (response, status) {
                                if (response.status == 200) {
                                    var data = response.responseJSON;
                                    member.user(data[0]);
                                }
                            });
                        }, 2000);
                    }
                });
            };
            StartupForm.prototype.removeMember = function (ind) {
                var members = this.members();
                var member = members[ind];
                if (!member)
                    return;
                if (member.uid()) {
                    member.deleted(true);
                }
                else {
                    this.members().splice(ind, 1);
                }
                this.members.valueHasMutated();
            };
            /**
             * Check if member is already into team list
             */
            StartupForm.prototype.isCurrentMember = function (email, member) {
                if (!email)
                    return;
                email = email.toLowerCase();
                var members = this.members();
                for (var i = 0; i < members.length; i++) {
                    var current = members[i];
                    if (member != current) {
                        if (current.user()) {
                            if (current.user().email.toLowerCase() == email) {
                                return true;
                            }
                        }
                        else if (current.email().toLowerCase() == email) {
                            return true;
                        }
                    }
                }
                return false;
            };
            StartupForm.prototype.fill = function (data) {
                var _this = this;
                this.uid(data.uid);
                this.name(data.name);
                this.email(data.email);
                this.punchLine(data.punchLine);
                this.image(data.image);
                this.website(data.link_website);
                this.twitter(data.link_twitter);
                this.facebook(data.link_facebook);
                this.month(data.startedMonth);
                this.year(data.startedYear);
                this.members([]);
                $.each(data.members, function (k, v) {
                    var member = _this.createMember();
                    member.uid(v.uid);
                    member.role(v.role);
                    member.email(v.invitation_email);
                    member.invitationSentAt(v.invitationSentAt);
                    member.user(v.user);
                    member.joined(v.joined == 1);
                    _this.members.push(member);
                });
            };
            /**
             * Submit data
             */
            StartupForm.prototype.submit = function () {
                var _this = this;
                if (!this.checkForm()) {
                    return false;
                }
                var data = {
                    name: this.name(),
                    email: this.email(),
                    punchLine: this.punchLine(),
                    image: this.image(),
                    link_twitter: this.twitter(),
                    link_website: this.website(),
                    link_facebook: this.facebook(),
                    startedMonth: this.month(),
                    startedYear: this.year(),
                    members: []
                };
                $.each(this.members(), function (k, v) {
                    data.members.push({
                        uid: v.uid(),
                        user_uid: v.user() ? v.user().uid : null,
                        role: v.role(),
                        invitation_email: v.email(),
                        deleted: v.deleted()
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
                    if (response.status != 204) {
                        error("Mince, une erreur est apparue est nous n'avons pas pu mettre à jour les informations :(");
                    }
                    else {
                        success("Well done, vos informations sont à jour !");
                        model.load(_this.uid());
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
                this.events = ko.observableArray();
                this.form = new StartupForm(this);
                this.storyform = new StartupStoryForm();
                this.startup.subscribe(function (s) {
                    _this.form.fill(s);
                    _this.storyform.new(s.uid);
                    _this.listStories();
                    _this.listEvents();
                });
                this.index.subscribe(function (i) {
                    $('#sections').formslider('animate:' + (i - 1));
                });
                this.stories.subscribe(function () {
                    setTimeout(function () {
                        $('#stories .timeago').timeago();
                        $('#stories *[title]').tooltipster();
                    }, 100);
                });
                this.events.subscribe(function () {
                    setTimeout(function () {
                        $('#events .timeago').timeago();
                    }, 100);
                });
            }
            Model.prototype.load = function (name) {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + name,
                    data: { norestrict: true },
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.startup(response.responseJSON);
                    }
                    else {
                        error("Mince, une erreur est apparue et il nous est impossible de charger vos informations :(");
                    }
                });
            };
            Model.prototype.newStory = function () {
                this.storyform.new(this.startup().uid);
                $('#stories').formslider('animate:1');
            };
            /**
             * Load data story
             */
            Model.prototype.loadStory = function (uid) {
                var _this = this;
                var story = this.findStory(uid);
                if (story) {
                    this.storyform.fill(story);
                    $('#stories').formslider('animate:1');
                    return;
                }
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
            /**
             * Return story
             */
            Model.prototype.findStory = function (uid) {
                var stories = this.stories();
                return stories.findBy('uid', uid);
            };
            /**
             * Return story
             */
            Model.prototype.findAndUpdateStory = function (uid, data) {
                var story = this.findStory(uid);
                var ind = this.stories().indexOf(story);
                this.stories()[ind] = data;
                this.stories.notifySubscribers();
            };
            /**
             * Change a setting of a story
             */
            Model.prototype.updateStorySettings = function (uid, settings) {
                var _this = this;
                var request = {
                    type: 'put',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid,
                    data: JSON.stringify(settings),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.findAndUpdateStory(uid, response.responseJSON);
                    }
                    else {
                        error("Mince, une erreur est apparue durant le traitement de votre requête :(");
                    }
                });
            };
            /**
             * Share story
             */
            Model.prototype.shareStory = function (uid) {
                var _this = this;
                var request = {
                    type: 'put',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid + '?share=1',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.findAndUpdateStory(uid, response.responseJSON);
                    }
                    else {
                        error("Mince, une erreur est apparue durant le traitement de votre requête :(");
                    }
                });
            };
            Model.prototype.editStory = function (uid) {
                this.loadStory(uid);
            };
            Model.prototype.showSection = function (i) {
                this.index(i);
            };
            /**
             * Load stories
             */
            Model.prototype.listStories = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/all?norestrict=true',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.stories(response.responseJSON);
                    }
                });
            };
            /**
             * Load events
             */
            Model.prototype.listEvents = function () {
                var _this = this;
                var request = {
                    type: 'get',
                    url: host + 'rest/startup/' + this.startup().uid + '/event/all?norestrict=true',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        _this.events(response.responseJSON);
                    }
                });
            };
            /**
             * Init story text editor
             */
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
    })(startupEdit = colaunch.startupEdit || (colaunch.startupEdit = {}));
})(colaunch || (colaunch = {}));
//# sourceMappingURL=project-edit.js.map