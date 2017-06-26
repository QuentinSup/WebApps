module startupfollows.startup {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    declare function isValidEmail(email);
    declare function toast(message, opts?);
    declare function error(message, title?, opts?);
    declare function success(message, title?, opts?);
    
    class Model {

        public name = ko.observable();
        public password = ko.observableArray();
        public password2 = ko.observableArray();
        public email = ko.observable();
        public isUserNameUnique = ko.observable(false);
        public isUserEmailUnique = ko.observable(false);
        
        private __hdlCheckIfExistsName;
        private __hdlCheckIfExistsEmail;

        public constructor() {

            this.name.subscribe((s: string): void => {
                
                this.isUserNameUnique(false);
                
                clearTimeout(this.__hdlCheckIfExistsName);
                
                if(!s) return;
                this.__hdlCheckIfExistsName = setTimeout((): void => {
                    this.verifyUserName();
                }, 500);  
            });
            
            this.email.subscribe((s: string): void => {
                
                this.isUserEmailUnique(false);

                clearTimeout(this.__hdlCheckIfExistsEmail);
                
                if(!s) return;
                
                if(!isValidEmail(s)) {
                   return; 
                }
                
                this.__hdlCheckIfExistsEmail = setTimeout((): void => {
                    this.verifyUserEmail();
                }, 500);
                
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
            };
            
            var request = {
                type: 'post',
                url: host + 'rest/user',
                data:  JSON.stringify(data), 
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    
                    success("Votre compte a été créé. Veuillez patientez durant que nous vous redirigeons vers la page d'accueil... ", "Welcome !", { showConfirmButton: false });
                    setTimeout(function() {
                        document.location.href = host + 'login';
                    }, 2000);
                    
                } else {
                    error("Holy s**t ! Une erreur est apparue durant la création de votre compte :(. Essayez de recommencer dans quelques minutes !");
                }
            });
            
            return false;
            
        }
        
        public prev() {
            $('#UserForm').formslider('prev');
        }
        
        /**
         * Controle email seized
         */
        public checkEmail(): boolean {
            
            if(!(this.email() || '').trim()) {
                toast("Il manque une adresse email pour votre compte");
                return false;
            }
            
            if(!isValidEmail(this.email())) {
                toast("Malheureusement, cette adresse ne semble pas valide. Êtes-vous sûr de l'avoir bien saisie ?");
                return false;
            }
            
            if(!this.isUserEmailUnique()) {
                toast("Malheureusement, cette adresse email est déjà utilisée");
                return false;
            }
            
            return true;
            
        }
        
        /**
         * Controle name seized
         */
        public checkName(): boolean {
            
            if(!(this.name() || '').trim()) {
                toast("Renseignez un nom utilisateur pour votre compte");
                return false;
            }
            
            if(!this.isUserNameUnique()) {
                toast("Malheureusement, ce nom est déjà pris");
                return false;
            }
            
            return true;
            
        }
        
        public checkForm(): boolean {
            if(!this.checkEmail()) {
                $('#UserForm').formslider('animate:0');    
                return false;
            }
            
            if(!this.checkName()) {
                $('#UserForm').formslider('animate:1');    
                return false;
            }   
            
            return true;
        }
        
        public next(): boolean {
            
            if(this.checkForm()) {
                $('#UserForm').formslider('next');
                return true;
            }
            
            return false;
            
        }
       
        
        /**
         * check if user name is already used into database
         */
        public verifyUserName(): boolean {
            
            this.isUserNameUnique(false);
            
            user.isNameUnique(this.name(), (b: boolean): void => {
                this.isUserNameUnique(b);         
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

    }


    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);

}
