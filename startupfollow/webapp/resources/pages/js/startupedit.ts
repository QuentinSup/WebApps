module startupfollows.startupEdit {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var tinymce;
    declare function error(message, title?);
    declare function success(message, title?);


    class StartupStoryForm {

        public startupUID = ko.observable();
        public uid = ko.observable();
        public shortLine = ko.observable();
        public text = ko.observable();

        public constructor() {

        }

        public new(startup_uid): void {
            this.shortLine('');
            this.text('');
            this.uid('');
            this.startupUID(startup_uid);
        }

        public fill(json): void {
            this.shortLine(json.shortLine);
            this.text(json.text);
            this.uid(json.uid);
            this.startupUID(json.startup_uid);
        }
        
        public cancel(): void {
            $('#stories').formslider('animate:first');    
        }

        public submit(): boolean {

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
            } else {
                request = {
                    type: 'post',
                    url: host + 'rest/startup/' + this.startupUID() + '/story',
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                };
            }

            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.cancel();
                    
                    if(!this.uid()) {
                         success("Well done ! Vos fans seront prochainement informés de votre nouvelle !");    
                    }
                    
                    window.model.listStories();    
                } else {
                    
                    error("Mince, une erreur est apparue durant la sauvegarde de votre nouvelle :(");
                    
                }
                    
            });

            return false;

        }

    }

    class StartupForm {

        public uid = ko.observable();
        public name = ko.observable();
        public punchLine = ko.observable();
        public email = ko.observable();
        public image = ko.observable();
        public website = ko.observable();
        public twitter = ko.observable();
        public facebook = ko.observable();
        public members = ko.observableArray();
        public nameExists = ko.observable(true);

        private __hdlCheckIfExists;

        public constructor() {

            this.name.subscribe((v: string): void => {
                this.nameExists(true);
                if (!v) return;
                clearTimeout(this.__hdlCheckIfExists);
                this.__hdlCheckIfExists = setTimeout((): void => {
                    this.checkIfExists(v);
                }, 500);
            });

        }

        public checkIfExists(name: string) {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                this.nameExists(response.status == 200);
            });

        }

        public addMember() {
            this.members.push({
                    uid: ko.observable(),
                    user_uid: ko.observable(),
                    role: ko.observable(),
                    email: ko.observable(),
                    user: ko.observable(),
                    invitationSentAt: ko.observable()
            });
        }

        public fill(data: any): void {
            this.uid(data.uid);
            this.name(data.name);
            this.email(data.email);
            this.punchLine(data.punchLine);
            this.image(data.image);
            this.website(data.link_website);
            this.twitter(data.link_twitter);
            this.facebook(data.link_facebook);

            this.members([]);

            $.each(data.members, (k, v): void => {
                var member = {
                    uid: ko.observable(),
                    user_uid: ko.observable(),
                    role: ko.observable(),
                    email: ko.observable(),
                    user: ko.observable(),
                    invitationSentAt: ko.observable()
                };

                member.uid(v.uid);
                member.user_uid(v.user_uid);
                member.role(v.role);
                member.email(v.invitation_email);
                member.invitationSentAt(v.invitationSentAt);
                member.user(v.user);

                this.members.push(member);
            });

        }

        /**
         * Submit data
         */
        public submit(): boolean {

            var data: any = {
                name: this.name(),
                email: this.email(),
                punchLine: this.punchLine(),
                image: this.image(),
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook(),
                members: []
            };

            $.each(this.members(), function(k, v) {
                data.members.push({
                    uid: v.uid(),
                    role: v.role(),
                    invitation_email: v.email()
                });
            });

            var request = {
                type: 'put',
                url: host + 'rest/startup/' + this.uid(),
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete(function(response, status) {
                if(response.status != 200) {
                      error("Mince, une erreur est apparue est nous n'avons pas pu mettre à jour les informations :(");
                } else {
                    success("Well done, vos informations sont à jour !");    
                }
            });

            return false;

        }

    }

    class Model {

        public index = ko.observable(1);
        public startup = ko.observable();
        public stories = ko.observableArray();
        public form = new StartupForm();
        public storyform = new StartupStoryForm();

        public constructor() {

            this.startup.subscribe((s: any): void => {
                this.form.fill(s);
                this.storyform.new(s.uid);
                this.listStories();
            });
            
            this.index.subscribe((i: number): void => {
                $('#sections').formslider('animate:' + (i - 1));    
            });

        }

        public load(name: string): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.startup(response.responseJSON);
                } else {
                    error("Mince, une erreur est apparue et il nous est impossible de charger vos informations :(");    
                }
            });

        }

        public newStory(): void {
            this.storyform.new(this.startup().uid);
            $('#stories').formslider('animate:1');
        }

        public loadStory(uid: string): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.storyform.fill(response.responseJSON);
                    $('#stories').formslider('animate:1');
                }
            });

        }

        public editStory(uid: string) {
            this.loadStory(uid);
        }

        public showSection(i: number) {
            this.index(i);
        }
        

        public listStories(): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.startup().uid + '/story/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.stories(response.responseJSON);
                }
            });
        }

        public initMCE() {

            tinymce.init({
                setup: function(ed) {
     
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

        }



    }

    var model = new Model();
    window.model = model;
    ko.applyBindings(model, $('#app')[0]);

    model.initMCE();

}
