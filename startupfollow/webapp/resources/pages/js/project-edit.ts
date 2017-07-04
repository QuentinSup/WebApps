module colaunch.startupEdit {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var tinymce;
    declare var user;
    declare function isValidEmail(email);
    declare function toast(message, opts?);
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
            this.text.notifySubscribers();
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

        /**
         * Submit story form
         */
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
        public month = ko.observable();
        public year = ko.observable();
        public punchLine = ko.observable();
        public email = ko.observable();
        public image = ko.observable();
        public website = ko.observable();
        public twitter = ko.observable();
        public facebook = ko.observable();
        public members = ko.observableArray();
        public nameExists = ko.observable(true);
        
        public isValidDate;

        public isEmailValid = ko.observable(false);
        public isCheckingNameExists = ko.observable(false);
        
        private __hdlCheckIfNameExists;
        private __hdlCheckIfEmailExists;
        
        private parent;
        
        public constructor(parent) {

            this.parent = parent;
            
            // Check existing name
            this.name.subscribe((v: string): void => {
                
                if(v == this.parent.startup().name) {
                    this.nameExists(false);
                    return;
                }
                
                this.nameExists(true);
                clearTimeout(this.__hdlCheckIfNameExists);
                if (!v) return;
                this.__hdlCheckIfNameExists = setTimeout((): void => {
                    this.checkIfExists(v);
                }, 500);
            });
            
            // Autovalidate email
            this.email.subscribe((v: string): void => {
                this.isEmailValid(v && isValidEmail(v));
            });
            
            this.isValidDate = ko.computed((): boolean => {
                
               if(!(this.month() || '').trim()) {
                    return false;
                }
                
                var month = this.month() * 1;
                if(!(month >= 1 && month <= 12)) {
                    return false;     
                }
                
                if(!(this.year() || '').trim()) {
                    return false;
                }
                
                var year = this.year();
                if(year.length != 4 || isNaN(year)) {
                    return false;   
                }
                
                var now = new Date();
                year = year * 1;
                if(year < now.getFullYear() - 50 || year > now.getFullYear()) {
                    toast("Etes-vous certain de l'année ?");
                    return false;   
                }
                
                if(year == now.getFullYear() && month > now.getMonth() - 1) {
                    toast("Etes-vous certain du mois ?");
                    return false;    
                }
            
                return true;
 
            }).extend({ throttle: 100 });

        }
        
        /**
         * Check form
         */
        public checkForm(): boolean {

            if(!(this.name() || '').trim()) {
                toast("Le nom ne doit pas être vide !");
                this.parent.showSection(1);
                return false;
            }
            
            if(this.nameExists()) {
                toast("Ce nom est déjà utilisé !");
                this.parent.showSection(1);
                return false;
            }
                       
            if(!this.isEmailValid()) {
                toast("L'adresse email n'est pas valide !");
                this.parent.showSection(1);
                return false;
            }
            
            if(!this.isValidDate()) {
                toast("La date de début du projet n'est pas valide !");
                this.parent.showSection(1);
                return false;
            }
            
            return true;
            
        }
        
        public checkIfExists(name: string) {

            this.isCheckingNameExists(true);
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/exists/' + name + '?ref=' + this.uid(),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                this.isCheckingNameExists(false);
                this.nameExists(response.status == 200);
            });

        }

        private createMember() {
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
        }
        
        public addMember() {
            
            var member = this.createMember();
            
            this.members.push(member);
            
            member.email.subscribe((s: string): void => {
                clearTimeout(this.__hdlCheckIfEmailExists);
                if(s && isValidEmail(s)) {
                    
                    this.__hdlCheckIfEmailExists = setTimeout((): void => {
                                            
                        if(this.isCurrentMember(s, member)) {
                            member.email('');
                            toast("Ce membre est déjà présent dans la liste");
                            return;
                        }
                        
                        user.search({ email: s }, (response, status): void => {
                            if(response.status == 200) { 
                                var data = response.responseJSON;
                                member.user(data[0]);
                            }
                        });   
                        
                    }, 2000); 
                }
            });
            
        }
        
        public removeMember(ind: number): void {
        
            var members = this.members();
            var member = members[ind];
            
            if(!member) return;
            
            if(member.uid()) {
                member.deleted(true);
            } else {
                this.members().splice(ind, 1);    
            }

            this.members.valueHasMutated();
            
        }
        
        /**
         * Check if member is already into team list
         */
        public isCurrentMember(email, member): boolean {
            if(!email) return;
            email = email.toLowerCase();
            var members = this.members();
            for(var i = 0; i < members.length; i++) {
                var current: any = members[i];
                if(member != current) {
                    
                    if(current.user()) {
                        if(current.user().email.toLowerCase() == email) {
                            return true;    
                        }
                    } else if(current.email().toLowerCase() == email) {
                        return true;
                    }
                }
            }
            return false;
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
            this.month(data.startedMonth);
            this.year(data.startedYear);
            
            this.members([]);

            $.each(data.members, (k, v): void => {
                
                var member = this.createMember();

                member.uid(v.uid);
                member.role(v.role);
                member.email(v.invitation_email);
                member.invitationSentAt(v.invitationSentAt);
                member.user(v.user);
                member.joined(v.joined == 1);

                this.members.push(member);
            });

        }
       

        /**
         * Submit data
         */
        public submit(): boolean {

            if(!this.checkForm()) {
                return false;
            }
            
            var data: any = {
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

            $.each(this.members(), function(k, v) {
                data.members.push({
                    uid: v.uid(),
                    user_uid: v.user()?v.user().uid:null,
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

            $.ajax(request).complete((response, status): void => {
                if(response.status != 204) {
                      error("Mince, une erreur est apparue est nous n'avons pas pu mettre à jour les informations :(");
                } else {
                    success("Well done, vos informations sont à jour !");
                    model.load(this.uid());   
                }
            });

            return false;

        }

    }

    class Model {

        public index = ko.observable(1);
        public startup = ko.observable();
        public stories = ko.observableArray();
        public events = ko.observableArray();
        public form = new StartupForm(this);
        public storyform = new StartupStoryForm();

        public constructor() {

            this.startup.subscribe((s: any): void => {
                this.form.fill(s);
                this.storyform.new(s.uid);
                this.listStories();
                this.listEvents();
            });
            
            this.index.subscribe((i: number): void => {
                $('#sections').formslider('animate:' + (i - 1));    
            });
            
            this.stories.subscribe((): void => {
                setTimeout(function() {
                    $('#stories .timeago').timeago();
                    $('#stories *[title]').tooltipster();
                }, 100);   
            });
            
            this.events.subscribe((): void => {
                setTimeout(function() {
                    $('#events .timeago').timeago();
                }, 100);   
            });

        }

        public load(name: string): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                data: { norestrict: true },
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

        /**
         * Load data story
         */
        public loadStory(uid: string): void {

            var story = this.findStory(uid);            
            
            if(story) {
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

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.storyform.fill(response.responseJSON);
                    $('#stories').formslider('animate:1');
                }
            });

        }
        
        /**
         * Return story
         */
        public findStory(uid): any {
            var stories = this.stories();
            return stories.findBy('uid', uid);
        }
        
        /**
         * Return story
         */
        public findAndUpdateStory(uid, data): any {
            var story = this.findStory(uid);
            var ind = this.stories().indexOf(story);  
            this.stories()[ind] = data;
            this.stories.notifySubscribers();
        }
        
        /**
         * Change a setting of a story
         */
        public updateStorySettings(uid: string, settings: any): void {

            var request = {
                type: 'put',
                url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid,
                data: JSON.stringify(settings),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
          

            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.findAndUpdateStory(uid, response.responseJSON);
                } else {  
                    error("Mince, une erreur est apparue durant le traitement de votre requête :(");
                }
                    
            });    
            
        }
        
        /**
         * Share story
         */
        public shareStory(uid: string): void {

            var request = {
                type: 'put',
                url: host + 'rest/startup/' + this.startup().uid + '/story/' + uid + '?share=1',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
          

            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.findAndUpdateStory(uid, response.responseJSON);
                } else {  
                    error("Mince, une erreur est apparue durant le traitement de votre requête :(");
                }
                    
            });    
            
        }

        public editStory(uid: string) {
            this.loadStory(uid);
        }

        public showSection(i: number) {
            this.index(i);
        }
        

        /**
         * Load stories
         */
        public listStories(): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.startup().uid + '/story/all?norestrict=true',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.stories(response.responseJSON);
                }
            });
        }
        
        /**
         * Load events
         */
        public listEvents(): void {

            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.startup().uid + '/event/all?norestrict=true',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    this.events(response.responseJSON);
                }
            });
        }

        /**
         * Init story text editor
         */
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
                insert_toolbar: 'bullist bold blockquote| quickimage',
                selection_toolbar: 'bold italic underline strikethrough | bullist | quicklink blockquote',
                inline: true,
                plugins: [
                    "advlist autolink link image lists charmap print hr anchor pagebreak",
                    "searchreplace wordcount visualblocks visualchars code media nonbreaking",
                    "save contextmenu directionality template paste textcolor"
                ]
            });
            
        }

    }

    var model = new Model();
    window.model = model;
    ko.applyBindings(model, $('#app')[0]);

    model.initMCE();

}
