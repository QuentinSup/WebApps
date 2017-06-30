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
                var request = {
                    type: 'post',
                    url: host + 'rest/startup/' + this.startupUID() + '/story',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        if (!_this.uid()) {
                            success("Well done ! Vos fans seront prochainement informés de votre nouvelle !");
                        }
                    }
                    else {
                        error("Mince, une erreur est apparue durant la sauvegarde de votre nouvelle :(");
                    }
                });
                return false;
            };
            return StartupStoryForm;
        })();
        var Model = (function () {
            function Model() {
                var _this = this;
                this.startup = ko.observable();
                this.storyform = new StartupStoryForm();
                this.startup.subscribe(function (s) {
                    _this.storyform.new(s.uid);
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
            /**
             * Share story
             */
            Model.prototype.shareStory = function (uid) {
                var request = {
                    type: 'put',
                    url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid + '?share=1',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
                $.ajax(request).complete(function (response, status) {
                    if (response.status == 200) {
                        success("Congrats ! Votre nouvelle a été partagée avec vos fans !");
                    }
                    else {
                        error("Mince, une erreur est apparue durant le traitement de votre requête :(");
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
                    insert_toolbar: 'bullist bold blockquote| quickimage',
                    selection_toolbar: 'bold italic underline strikethrough | bullist | quicklink blockquote',
                    inline: true,
                    plugins: [
                        "advlist autolink link image lists charmap print hr anchor pagebreak",
                        "searchreplace wordcount visualblocks visualchars code media nonbreaking",
                        "save contextmenu directionality template paste textcolor"
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
//# sourceMappingURL=project-storify.js.map