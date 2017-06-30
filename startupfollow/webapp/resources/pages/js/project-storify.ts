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

            var request = {
                type: 'post',
                url: host + 'rest/startup/' + this.startupUID() + '/story',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {

                    if(!this.uid()) {
                         success("Well done ! Vos fans seront prochainement informés de votre nouvelle !");    
                    }
                    
                } else {
                    
                    error("Mince, une erreur est apparue durant la sauvegarde de votre nouvelle :(");
                    
                }
                    
            });

            return false;

        }

    }

    class Model {

        public startup = ko.observable();
        public storyform = new StartupStoryForm();

        public constructor() {

            this.startup.subscribe((s: any): void => {
                this.storyform.new(s.uid);
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
                    success("Congrats ! Votre nouvelle a été partagée avec vos fans !");
                } else {  
                    error("Mince, une erreur est apparue durant le traitement de votre requête :(");
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
