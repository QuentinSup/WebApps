module startupfollows {
    
    declare var projects;
    declare var ko;
    declare var $;
    
    class StartupFormRequest {
     
        public name     = ko.observable();
        public email    = ko.observable();
        
        public constructor() {}
           
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
        
        public P = ko.observableArray(projects);
        public R = ko.observableArray();
        public searchValue = ko.observable();
        public startupRequestForm = new StartupFormRequest();
        
        public constructor() {
         
            // search function
            this.searchValue.subscribe((str: string): any => {
                this.R($.map(this.P(), (v: any): void => {
                    return (str && v.name.toLowerCase().startsWith(str.toLowerCase()))?v:null;
                }));
            });
            
        }
        
        
        
    }
    
    ko.applyBindings(new Model(), $('#app')[0]);
    
}
    