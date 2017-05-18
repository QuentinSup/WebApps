module startupfollows.startup {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;

    class Model {

        public name = ko.observable();
        public password = ko.observableArray();
        public password2 = ko.observableArray();
        public email = ko.observable();
        public isUserNameUnique = ko.observable(false);
        public isUserEmailUnique = ko.observable(false);
        
        private __hdlCheckIfExistsName;
        private __hdlCheckIfExistsEmail;

        public constructor() {

            this.name.subscribe((s: string): void => {
                if(!s) return;
                clearTimeout(this.__hdlCheckIfExistsName);
                this.__hdlCheckIfExistsName = setTimeout((): void => {
                    this.verifyUserName();
                }, 500);  
            });
            
            this.email.subscribe((s: string): void => {
                if(!s) return;
                clearTimeout(this.__hdlCheckIfExistsEmail);
                this.__hdlCheckIfExistsEmail = setTimeout((): void => {
                    this.verifyUserEmail();
                }, 500);  
            });
            
        }

        /**
         * Submit data
         */
        public submit(): boolean {
            
            var data: any = {
                name: this.name(),
                email: this.email(),
            };
            
            var request = {
                type: 'post',
                url: host + 'rest/user',
                data:  JSON.stringify(data), 
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                        
                    
                } else {
                    alert(status);    
                }
            });
            
            return false;
            
        }
        
        public prev() {
            $('#UserForm').unslider('prev');
        }
        
        public next() {
            $('#UserForm').unslider('next');
        }
        
        /**
         * check if user name is already used into database
         */
        public verifyUserName(): boolean {
            
            
            var request = {
                type: 'get',
                url: host + 'rest/user/username/' + this.name(),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            this.isUserNameUnique(false);
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.isUserNameUnique(true);        
                } else {
                    alert(status);    
                }
            });
            
            return false;
            
        }
        
 
        /**
         * check if user email is already used into database
         */
        public verifyUserEmail(): boolean {
            
            
            var request = {
                type: 'get',
                url: host + 'rest/user/email/' + this.email(),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            this.isUserEmailUnique(false);
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.isUserEmailUnique(true);        
                } else {
                    alert(status);    
                }
            });
            
            return false;
            
        }
        
        
        


    }


    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);

}
