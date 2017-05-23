module startupfollows.startup {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    declare function error(message, title?);
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
         * Submit data
         */
        public submit(): boolean {
            
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
                    document.location.href = host;
                    
                    
                } else {
                    error("Holy s**t ! Une erreur est apparue durant la création de votre compte :(<br />Essayez de recommencer dans quelques minutes !");
                }
            });
            
            return false;
            
        }
        
        public prev() {
            $('#UserForm').formslider('prev');
        }
        
        public next() {
            $('#UserForm').formslider('next');
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
