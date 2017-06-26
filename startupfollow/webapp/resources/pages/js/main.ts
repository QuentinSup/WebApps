module startupfollows.main {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare function error(message, title?);
    declare function success(message, title?, opts?);
    
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
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 201) {
                    success("Un email a été envoyé au porteur du projet '" + this.name() + "' ;)", "Super !");
                    this.name('');
                    this.email('');
                } else {
                    error("Holy s**t !<br />Une erreur est apparue durant le traitement de la requête. Essayez de recommencer dans quelques minutes (on sait jamais) !");
                }
            });
            
            return false;
            
        }
        
    }
    
    class Model {
        
        public P = ko.observableArray();
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
            
            this.getAllProjects();
            
        }
        
        /**
         * retourne la liste des projets
         */
        public getAllProjects(): void {

            var request = {
                type: 'get',
                url: 'rest/startup/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                   if(response.status == 200) {
                       var projects = [];
                        $.each(response.responseJSON, (k, v): void => {
                            projects.push(v);    
                        });
                       this.P(projects);
                   }
            });

        }
        
        
    }
    
    ko.applyBindings(new Model(), $('#app')[0]);
    
}
    