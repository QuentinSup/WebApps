module startupfollows.startupEdit {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;

    class Model {

        public stories = ko.observableArray();
        public startup = ko.observable();
        
        public constructor() {
         
            this.startup.subscribe((s: any): void => {
                this.list();
            });
            
        }
        
        public find(name: string): void {
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                 if(response.status == 200) {
                    this.startup(response.responseJSON);
                 }
            });    
        }
        
        public list(): void {
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.startup().uid + '/story/all',
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
    