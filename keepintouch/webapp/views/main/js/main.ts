
module webapp.keepintouch {
    
    import ViewModel = kit.ViewModel;
    import EmailUIField = kit.fields.EmailUIField;
    import ToggleUIField = kit.fields.ToggleUIField;
    import TextUIField = kit.fields.TextUIField;
    import TextAreaUIField = kit.fields.TextAreaUIField;
    import Query = kit.helpers.Query;
    
    class MainPage extends ViewModel {
        
        public FromName: TextUIField;
        public FromEmail: EmailUIField;
        public FromMessage: TextAreaUIField;
        
        public ToName: TextUIField;
        public ToEmail: EmailUIField;
        
        public AdrEmail: EmailUIField;
        public AdrEmailCoche: ToggleUIField;
        
        public AdrPostalLigne1: TextUIField;
        public AdrPostalLigne2: TextUIField;
        public AdrPostalLigne3: TextUIField;
        public AdrPostalCdPost: TextUIField;
        public AdrPostalVille: TextUIField;
        public AdrPostalCoche: ToggleUIField;
        
        public constructor() {
            super(null);
            
            this.FromName = new TextUIField('Votre nom', null, true);
            this.FromEmail = new EmailUIField('Votre adresse email', null, true);
            this.FromMessage = new TextAreaUIField('Votre message', null, false);
            
            this.ToName = new TextUIField('Nom de votre correspondant', null, true);
            this.ToEmail = new EmailUIField('Son adresse email', null, true);
            
            this.AdrEmailCoche = new ToggleUIField('EmailCoche', true, false, false);
            this.AdrEmailCoche.showLabel(false);
            this.AdrEmail = new EmailUIField('Vérifier son adresse email', null, false);
            this.AdrEmail.placeholder("Saisissez la dernière adresse email connue");
            this.AdrEmail.isDisabled.makeTrueIfNot(this.AdrEmailCoche.dataValue);
            
            this.AdrPostalCoche = new ToggleUIField('AdrPostaleCoche', true, false, false);
            this.AdrPostalCoche.showLabel(false);
            
            this.AdrPostalLigne1 = new TextUIField('Vérifier son adresse postale', null, false);
            this.AdrEmail.placeholder("Saisissez la dernière adresse connue");
            this.AdrPostalLigne2 = new TextUIField('', null, false);
            this.AdrPostalLigne3 = new TextUIField('', null, false);
            this.AdrPostalCdPost = new TextUIField('', null, false);
            this.AdrPostalVille = new TextUIField('', null, false);
            
            this.AdrPostalCdPost.showLabel(false);
            this.AdrPostalVille.showLabel(false);

            this.AdrPostalLigne1.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
            this.AdrPostalLigne2.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
            this.AdrPostalLigne3.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
            this.AdrPostalCdPost.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);
            this.AdrPostalVille.isDisabled.makeTrueIfNot(this.AdrPostalCoche.dataValue);

        }
        
        /**
         * 
         */
        public onSubmit(): void {
            
            var json = {};
            var jsonFrom = {};
            var jsonTo = {};
            var requests = [];
            
            if(this.AdrEmailCoche.dataValue()) {
                requests.push({
                    'type': 'email',
                    'value': this.AdrEmail.dataValue()    
                });
            }
            
            if(this.AdrPostalCoche.dataValue()) {
                requests.push({
                    'type': 'adress',
                    'value': {
                        'street-address'    : this.AdrPostalLigne1.dataValue(),
                        'extended-address'  : this.AdrPostalLigne2.dataValue(),
                        'postal-code'       : this.AdrPostalCdPost.dataValue(),
                        'locality'          : this.AdrPostalVille.dataValue()
                    }    
                });
            }
            
            jsonTo['name']        = this.ToName.dataValue();
            jsonTo['email']       = this.ToEmail.dataValue();
            
            jsonFrom['name']        = this.FromName.dataValue();
            jsonFrom['message']     = this.FromMessage.dataValue();
            jsonFrom['reply_email'] = this.FromEmail.dataValue();
            
            json['to'] = jsonTo;
            json['from'] = jsonFrom;
            json['requests'] = requests;
            
            if(requests.length > 0) {
                Query.POST(app.servicesPath + 'request', json, (data, status): void => {
                    
                });
            }
            
        }

    }    
    
    new MainPage().applyBindings("#app");
   
    
}