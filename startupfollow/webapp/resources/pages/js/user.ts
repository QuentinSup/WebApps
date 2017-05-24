module startupfollows.startup {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    
    class UserModel {
        
        public data = ko.observable();
        public isReady = ko.observable(false);
        
        public constructor() {
         
            this.data.subscribe((v: any): void => {
                if(v) {
                    this.isReady(true);
                }
            });
            

        }
        
        public ready(fn: Function): void {
            if(this.isReady()) {
                fn.call(this, this, this.data());    
                return;
            }
        
            var subscription = this.isReady.subscribe((b: boolean): void => {
                if(b) {
                    subscription.dispose();
                    this.ready(fn);
                }
            });
        
        }
        
        public load() {
        
            var request = {
                type: 'get',
                url: host + 'rest/user/',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                if(response.status == 200) {
                    this.data(response.responseJSON);
                } else {
                    throw "Utilisateur introuvable";
                }
            });
            
        }
        
        public isFollowingStartup(uid: string): boolean {
         
            var subscriptions = this.data().subscriptions || [];
            for(var i = 0; i < subscriptions.length; i++) {
                if(subscriptions[i].startup_uid == uid) {
                   return true;     
                }
            }
        
            return false;
        
        }

        public likeStory(uid: string, callback?: Function): void {
            
            var request = {
                type: 'post',
                url: host + 'rest/user/story/' + uid + '/like',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                 if(response.status == 204) {
                    
                 }
                 if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                 }
                
            });   
            
        }
        
        public follow(uid: string, callback?: Function): void {
            
            var request = {
                type: 'post',
                url: host + 'rest/startup/' + uid + '/subscribe',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                 if(response.status == 200) {
                    
                 }
                 if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                 }
            });   
            
        }
        
        public unfollow(uid: string, callback?: Function): void {
            
            var request = {
                type: 'delete',
                url: host + 'rest/startup/' + uid + '/subscribe',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void  {
                 if(response.status == 200) {
                    
                 }
                 if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                 }
            });   
            
        }
        
        public unlog(callback?: Function) {
         
            var request = {
                type: 'delete',
                url: host + 'rest/user/auth',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                 if(response.status == 200) {
                    document.location.href = host + 'login';
                 }
                 if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                 }
            }); 
            
        }
        
        public isNameUnique(name: string, callback?: Function): void {
            
            var request = {
                type: 'get',
                url: host + 'rest/user/username/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                if(typeof(callback) == "function") {
                    callback.call(this, response.status == 200);    
                }
            });

        }
        
        /**
         * check if user email is already used into database
         */
        public isEmailUnique(email: string, callback?: Function): void {
            
            
            var request = {
                type: 'get',
                url: host + 'rest/user/email/' + email,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };

            
            $.ajax(request).complete((response, status): void => {
                if(typeof(callback) == "function") {
                    callback.call(this, response.status == 200);    
                }
            });
            
        }
        
        /**
         * Update user data
         */
        public update(data: string, callback?: Function): void {
            
            var request = {
                type: 'put',
                data: JSON.stringify(data),
                url: host + 'rest/user',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                }
            });
            
        }
        
        /**
         * Search users
         */
        public search(data: string, callback?: Function): void {
            
            var request = {
                type: 'get',
                data: data,
                url: host + 'rest/user/search',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                }
            });
            
        }
        
    }

    window.user = new UserModel();
    
}
    