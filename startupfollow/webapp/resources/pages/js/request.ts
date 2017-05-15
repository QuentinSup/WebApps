module startupfollows {
    
    declare var projects;
    declare var ko;
    declare var $;
    
    class StartupAddForm {
     
        public name     = ko.observable();
        public email    = ko.observable();
        
        public constructor() {}
           
        
        public next() {
                
        }
        
        /**
         * Submit data
         */
        public submit(): boolean {
            
            var data = {
                name: this.name(),
                email: this.email()    
            };
            
            var request = {
                type: 'post',
                url: 'rest/request',
                data:  JSON.stringify(data), 
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status) {
                   console.log(status, response);
            });
            
            return false;
            
        }
        
    }
    
    class Model {
        
        public form = new StartupAddForm();
        
        public constructor() {
         
        
            
        }
        
        
        
    }
    
    ko.applyBindings(new Model(), $('#app')[0]);
    
}
    