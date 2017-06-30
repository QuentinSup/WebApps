module colaunch {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var tinymce;
    declare var user;
    declare function isValidEmail(email);
    declare function error(message, title?, opts?);
    declare function success(message, title?, opts?);
    declare function toast(message, opts?);

    class UserForm {

        public uid = ko.observable();
        public name = ko.observable();
        public email = ko.observable();
        public firstName = ko.observable();
        public lastName = ko.observable();
        public password1 = ko.observable();
        public password2 = ko.observable();
        public image = ko.observable();
        public website = ko.observable();
        public twitter = ko.observable();
        public facebook = ko.observable();
        
        public isPassword1Valid;
        public isPassword2Valid;
        
        public isCheckingNameUnique = ko.observable(false);
        public isCheckingEmailUnique = ko.observable(false);
        
        public isEmailValid = ko.observable(false);
        
        public isUserNameUnique = ko.observable(false);
        public isUserEmailUnique = ko.observable(false);
        
        private __hdlCheckIfExistsName;
        private __hdlCheckIfExistsEmail;

        private parent;
        
        public constructor(parent: any) {

            this.parent = parent;
            
            this.name.subscribe((s: string): void => {
                
                clearTimeout(this.__hdlCheckIfExistsName);
                
                if(s == user.data().name) {
                    this.isUserNameUnique(true);
                    return;    
                }
                
                this.isUserNameUnique(false);
                
                if(!s) return;
                this.__hdlCheckIfExistsName = setTimeout((): void => {
                    this.verifyUserName();
                }, 500);  
            });
            
            this.email.subscribe((s: string): void => {
                
                clearTimeout(this.__hdlCheckIfExistsEmail);
                
                if(s == user.data().email) {
                    this.isUserEmailUnique(true);
                    return;    
                }
                
                this.isUserEmailUnique(false);
                
                if(!s) return;
                
                this.isEmailValid(isValidEmail(s));
                
                if(this.isEmailValid()) {
                    this.__hdlCheckIfExistsEmail = setTimeout((): void => {
                        this.verifyUserEmail();
                    }, 500);  
                }
            });

            this.isPassword1Valid = ko.computed((): boolean => {
                var v: string = this.password1() || '';
                return user.isPasswordStrengthOK(v);  
            }).extend({ throttle: 100 });
            
            this.isPassword2Valid = ko.computed((): boolean => {
                return this.isPassword1Valid() && this.password2() == this.password1();
            }).extend({ throttle: 100 });
            
        }

        /**
         * check if user name is already used into database
         */
        public verifyUserName(): boolean {
            
            this.isCheckingNameUnique(true);
            this.isUserNameUnique(false);
            
            user.isNameUnique(this.name(), (b: boolean): void => {
                this.isCheckingNameUnique(false);
                this.isUserNameUnique(b);     
                if(b && this.name().toLowerCase() != user.data().name.toLowerCase()) {
                    toast("Votre nouveau nom vous va à ravir ;)", { id: 'usernameunique' });
                }    
            });
            
            return false;
            
        }

        /**
         * check if user email is already used into database
         */
        public verifyUserEmail(): boolean {
            
            this.isCheckingEmailUnique(true);
            this.isUserEmailUnique(false);  
            
            user.isEmailUnique(this.email(), (b: boolean): void => {
                this.isCheckingEmailUnique(false);
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
         * Check form data
         */
        public checkForm(): boolean {
            
            if(!(this.name() || '').trim()) {
                toast("N'oubliez pas d'indiquer votre nom de connexion !");
                this.parent.showSection(1);
                return false;    
            }
            
            if(!(this.email() || '').trim()) {
                toast("Votre email est nécessaire !");
                this.parent.showSection(1);
                return false;    
            }
            
            if(!this.isEmailValid()) {
                toast("Votre email n'est pas valide !");
                this.parent.showSection(1);
                return false;
            }
            
            if(!this.isUserEmailUnique()) {
                toast("Cet email est déjà utilisé par un autre compte !");
                this.parent.showSection(1);
                return false;
            }
            
            if(!this.isUserNameUnique()) {
                toast("Cet identifiant est déjà utilisé par un autre compte !");
                this.parent.showSection(1);
                return false;
            }
            
            return true;
            
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
        
        /**
         * Submit data
         */
        public passwordSubmit(): boolean {

            if(!this.isPassword1Valid() || !this.isPassword2Valid()) {
                return false;
            }

            user.changePassword(this.password1(), function(response, status) {
                if(response.status != 200) {
                      error("Un problème est apparu durant le changement de votre mot de passe :(");
                } else {
                    success("Well done, vous allez recevoir une confirmation par email avec votre nouveau mot de passe !");    
                }
            });

            return false;

        }

    }

    class Model {

        public index = ko.observable(1);
        public form = new UserForm(this);

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
