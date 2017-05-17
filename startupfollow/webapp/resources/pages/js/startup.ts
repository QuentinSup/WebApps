module startupfollows.startup {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    
    class Model {
        
        public data = ko.observable();
        public stories = ko.observableArray();
        
        public constructor() {
         
            this.data.subscribe((s: any): void => {
                this.listStories();
            });
            
        }
        
        public find(id: string) {
        
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + id,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.data(response.responseJSON);
                } else {
                    throw "Startup introuvable";
                }
                
                $(document).trigger('unsyncready');
                
            });
            
        }
        
        public listStories(): void {
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.data().uid + '/story/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                 if(response.status == 200) {
                    this.stories(response.responseJSON);
                 }
            });    
        } 

        
    }
    
    
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
    
}
    