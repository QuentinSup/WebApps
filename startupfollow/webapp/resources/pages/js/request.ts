module startupfollows.request {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    
    
    class StartupAddForm {
     
        public name      = ko.observable();
        public punchLine = ko.observable();
        public email     = ko.observable();
        public firstName = ko.observable();
        public lastName  = ko.observable();
        public image     = ko.observable();
        public website   = ko.observable();
        public twitter   = ko.observable();
        public facebook  = ko.observable();
        public members   = ko.observableArray();
        public nameExists = ko.observable(true);

        private __hdlCheckIfExists;
        
        public constructor() {
            this.addMember();
            
            this.name.subscribe((v: string): void => {
                this.nameExists(true);
                if(!v) return;
                clearTimeout(this.__hdlCheckIfExists);
                this.__hdlCheckIfExists = setTimeout((): void => {
                    this.checkIfExists(v);
                }, 500);    
            });
            
        }
        
        public checkIfExists(name: string) {
        
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                this.nameExists(response.status == 200);
            });
            
        }
           
        public prev() {
            $('#StartupAddForm').unslider('prev');
        }
        
        public next() {
            $('#StartupAddForm').unslider('next');
        }
        
        public addMember() {
            this.members.push({
                firstName: ko.observable(),
                lastName: ko.observable(),
                email: ko.observable()
            });
        }
        
        /**
         * Submit data
         */
        public submit(): boolean {
            
            var data: any = {
                name: this.name(),
                email: this.email(),
                punchLine: this.punchLine(),
                image: this.image(), 
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook(),
                members: [{
                    firstName: this.firstName(),
                    lastName: this.lastName(),
                    email: this.email(),
                    founder: 1
                }]
            };
            
            $.each(this.members(), function(k, v) {
                data.members.push({
                    firstName: v.firstName(),
                    lastName: v.lastName(),
                    email: v.email()
                });
            });
            
            var request = {
                type: 'post',
                url: host + 'rest/startup',
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
    
    
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
    
}
    