
module webapp.keepintouch {
    
    import ViewModel = kit.ViewModel;
    import EmailUIField = kit.fields.EmailUIField;
    import ToggleUIField = kit.fields.ToggleUIField;
    import TextUIField = kit.fields.TextUIField;
    import Query = kit.helpers.Query;
    
    declare var request_content;
    declare var request_id;
    
    class RequestConfirmationPage extends ViewModel {
        
        public showEmail: KnockoutObservable<boolean> = ko.observable(false);        
        public showAdress: KnockoutObservable<boolean> = ko.observable(false);
        
        public AdrEmail: EmailUIField;
        
        public AdrPostalLigne1: TextUIField;
        public AdrPostalLigne2: TextUIField;
        public AdrPostalCdPost: TextUIField;
        public AdrPostalVille: TextUIField;
        public AdrPostalCoche: ToggleUIField;
        
        public constructor() {
            super(null);

            var request_email = request_content.requests.findBy('type', 'email');
            var request_adress = request_content.requests.findBy('type', 'adress');
            
            this.showEmail(!!request_email);
            this.showAdress(!!request_adress);
            
            if(request_email) {
            
                this.AdrEmail = new EmailUIField('Votre adresse email', request_email.value, true);
                this.AdrEmail.placeholder("Renseigner votre adresse email");
                
            }
            
            if(request_adress) {
            
                this.AdrPostalLigne1 = new TextUIField('Votre adresse postale', request_adress.value["street-address"], true);
                this.AdrPostalLigne2 = new TextUIField('', request_adress.value["extended-address"], false);
                this.AdrPostalCdPost = new TextUIField('', request_adress.value["postal-code"], true);
                this.AdrPostalVille = new TextUIField('', request_adress.value["locality"], true);
                
                this.AdrPostalLigne2.showLabel(false);
                this.AdrPostalCdPost.showLabel(false);
                this.AdrPostalVille.showLabel(false);
                
            }

        }
        
        /**
         * 
         */
        public onSubmit(): void {
            
            var json = request_content;
            
            var request_email = request_content.requests.findBy('type', 'email');
            var request_adress = request_content.requests.findBy('type', 'adress');
            
            if(request_email) {
                request_email.value = this.AdrEmail.dataValue();
            }
            
            if(request_adress) {
                request_adress.value['street-address']    = this.AdrPostalLigne1.dataValue();
                request_adress.value['extended-address']  = this.AdrPostalLigne2.dataValue();
                request_adress.value['postal-code']       = this.AdrPostalCdPost.dataValue();
                request_adress.value['locality']          = this.AdrPostalVille.dataValue();
            }

            Query.PATCH(app.servicesPath + 'request/' + request_id, json, (data, status): void => {
                console.log(data);
            });
            
        }

    }    
    
    new RequestConfirmationPage().applyBindings("#app");
   
    
}