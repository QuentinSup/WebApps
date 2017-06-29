module colaunch {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare function isValidEmail(email);
    declare function toast(message, opts?);
    declare function error(message, title?);
    declare function success(message, title?, opts?);
    
    class Model {

        public name = ko.observable();
        public email = ko.observable();
        public password = ko.observable();
        
        public isCheckingLogin = ko.observable(false);
        public isCheckingPassword = ko.observable(false);

        public constructor() {


        }

        public login() {

            this.isCheckingLogin(true);
            
            var data = {
                name: this.name(),
                password: this.password()    
            }
            
            var request = {
                type: 'post',
                url: host + 'rest/user/auth',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                this.isCheckingLogin(false);
                if (response.status == 200) {
                    toast("Bienvenue " + this.name() + " ;)");
                    document.location.href = host + (response.responseJSON.redirect || '');
                } else {
                    this.password(''); 
                    error("Oups ! Votre identifiant ou votre mot de passe est incorrect");
                }
            });

        }
        
        /**
         * Show form to retrieve password
         */
        public showForgotPasswordForm() {
            $('#form').formslider('animate:1');    
        }
        
        /**
         * Send request to retrieve password
         */
        public retrievePassword() {
         
            if(!this.email().trim()) {
                toast("Merci de renseigner l'adresse email de votre compte");
                return;
            }
            
            if(!isValidEmail(this.email())) {
                toast("Cette adresse email ne semble pas valide");
                return;
            }
            
            this.isCheckingPassword(true);
            
            var data = {
                email: this.email()
            }
            
            var request = {
                type: 'delete',
                url: host + 'rest/user/password',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                this.isCheckingPassword(false);
                if (response.status == 200) {
                    success("Done ! Un nouveau mot de passe vous a été envoyé par email !");
                    $('#form').formslider('animate:0');
                } else {
                    error("Oups ! Il semble qu'une erreur nous empêche de vous communiquer un nouveau mot de passe. Êtes-vous sûr qu'il s'agit bien de votre adresse email associée à votre compte ?");
                }
            });
            
        }

    }


    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);

}
