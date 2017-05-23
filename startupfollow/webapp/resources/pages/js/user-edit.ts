module startupfollows.startupEdit {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var tinymce;
    declare var user;
    declare function error(message, title?, opts?);
    declare function success(message, title?, opts?);
    declare function toast(message, opts?);


    class UserForm {

        public uid = ko.observable();
        public name = ko.observable();
        public email = ko.observable();
        public firstName = ko.observable();
        public lastName = ko.observable();
        public password = ko.observableArray();
        public password2 = ko.observableArray();
        public image = ko.observable();
        public website = ko.observable();
        public twitter = ko.observable();
        public facebook = ko.observable();
        
        public isUserNameUnique = ko.observable(false);
        public isUserEmailUnique = ko.observable(false);
        
        private __hdlCheckIfExistsName;
        private __hdlCheckIfExistsEmail;

        public constructor() {

            this.name.subscribe((s: string): void => {
                
                this.isUserNameUnique(false);
                
                if(!s) return;
                clearTimeout(this.__hdlCheckIfExistsName);
                this.__hdlCheckIfExistsName = setTimeout((): void => {
                    this.verifyUserName();
                }, 500);  
            });
            
            this.email.subscribe((s: string): void => {
                
                this.isUserEmailUnique(false);
                
                if(!s) return;
                clearTimeout(this.__hdlCheckIfExistsEmail);
                this.__hdlCheckIfExistsEmail = setTimeout((): void => {
                    this.verifyUserEmail();
                }, 500);  
            });

        }

        /**
         * check if user name is already used into database
         */
        public verifyUserName(): boolean {
            
            this.isUserNameUnique(false);
            
            user.isNameUnique(this.name(), (b: boolean): void => {
                this.isUserNameUnique(b);     
                if(b) {
                    toast("Votre nouveau nom vous va à ravir ;)", { id: 'usernameunique' });
                }    
            });
            
            return false;
            
        }
        

        /**
         * check if user email is already used into database
         */
        public verifyUserEmail(): boolean {
            
             user.isEmailUnique(this.email(), (b: boolean): void => {
                this.isUserEmailUnique(b);         
            });
            
            return false;
            
        }

        public fill(data: any): void {
            this.uid(data.uid);
            this.name(data.name);
            this.email(data.email);
            this.firstName(data.firstName);
            this.lastName(data.lastName);
            this.image(data.image);
            this.website(data.link_website);
            this.twitter(data.link_twitter);
            this.facebook(data.link_facebook);
        }

        /**
         * Submit data
         */
        public submit(): boolean {

            var data: any = {
                name: this.name(),
                email: this.email(),
                firstName: this.firstName(),
                lastName: this.lastName(),
                image: this.image(),
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook()
            };

            user.update(data, function(response, status) {
                if(response.status != 200) {
                      error("Mince, une erreur est apparue est nous n'avons pas pu mettre à jour vos informations :(");
                } else {
                    success("Well done, vos informations sont à jour !");    
                }
            });

            return false;

        }

    }

    class Model {

        public index = ko.observable(1);
        public form = new UserForm();

        public constructor() {

            user.ready((user, data): void => {
                this.form.fill(data);
            });
            
            this.index.subscribe((i: number): void => {
                $('#sections').formslider('animate:' + (i - 1));    
            });

        }

        public showSection(i: number) {
            this.index(i);
        }
 
    }

    var model = new Model();
    window.model = model;
    ko.applyBindings(model, $('#app')[0]);

}
