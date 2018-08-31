module ticketing {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare function error(message, title?);
    declare function success(message, title?, opts?);
    
    
    class Model {
        
        public P = ko.observableArray();
        public isReady = ko.observable();
        
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
                url: host + '/rest/project/all',
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
    
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
    
}
    