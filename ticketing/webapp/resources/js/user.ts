module ticketing {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    
    export class UserModel {
        
        public static URI: string = 'rest/user/';
        
        public data = ko.observable();
        public isReady = ko.observable(false);
        
        private __jqxrNameUnique = null;
        private __jqxrEmailUnique = null;
        
        public constructor(data?) {

            this.data(data);
            
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
        
        public load(id: string = null) {
        
            var request = {
                type: 'get',
                url: host + UserModel.URI + (id || ''),
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

        /**
         * Log out user
         */
        public logout(callback?: Function) {
         
            var request = {
                type: 'delete',
                url: host + 'rest/user/auth',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                 if(response.status == 204) {
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
                url: host + 'rest/user/username/' + name + (this.data()?'?ref=' + this.data().uid:''),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            if(this.__jqxrNameUnique) {
                this.__jqxrNameUnique.abort();
                this.__jqxrNameUnique = null;
            }
            
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
                url: host + 'rest/user/email/' + email + (this.data()?'?ref=' + this.data().uid:''),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            if(this.__jqxrEmailUnique) {
                this.__jqxrEmailUnique.abort();
                this.__jqxrEmailUnique = null;
            }

            
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
                url: host + 'rest/user/' + this.data().uid,
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
         * Calculate password strength
         */
        public static calculatePasswordStrength(p: string): number { 
            if(p.length > 4) {
                return 50;
            }
            return 0;    
        }
        
        /**
         * Return true if password strength is enought
         */
        public static isPasswordStrengthOK(p: string): boolean {
            return UserModel.calculatePasswordStrength(p) >= 50;
        }
        
        /**
         * Update user password
         */
        public changePassword(password: string, callback?: Function): boolean {
            
            if(!UserModel.isPasswordStrengthOK(password)) {
                return false;    
            }
            
            var request = {
                type: 'put',
                data: JSON.stringify({ password: password }),
                url: host + 'rest/user/' + this.data().uid + '/password',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete(function(response, status): void {
                if(typeof(callback) == "function") {
                    callback.apply(this, arguments);    
                }
            });
            
            return true;
            
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
    