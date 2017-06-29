module colaunch {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    declare function isValidEmail(email): boolean;
    declare function toast(message, opts?);
    declare function error(message, title?, callback?);
    declare function success(message, title?, opts?, callback?);
    
    class StartupAddForm {
     
        public name      = ko.observable();
        public punchLine = ko.observable();
        public email     = ko.observable();
        public month     = ko.observable();
        public year      = ko.observable();
        public image     = ko.observable();
        public website   = ko.observable();
        public twitter   = ko.observable();
        public facebook  = ko.observable();
        public members   = ko.observableArray();
        public nameExists = ko.observable(true);
        public isEmailValid = ko.observable(false);

        public isValidDate;
        public isCheckingName = ko.observable(false);
        
        private __jqxrCheckIfNameExists;
        private __hdlCheckIfNameExists;
        private __hdlCheckIfEmailExists;
        
        /**
         * Constructor
         */
        public constructor() {
            
            // Prepare name control
            this.name.subscribe((v: string): void => {
                this.nameExists(true);
                clearTimeout(this.__hdlCheckIfNameExists);
                if(!v) return;
                this.__hdlCheckIfNameExists = setTimeout((): void => {
                    this.checkIfExists(v);
                }, 500);    
            });
            
            // Autovalidate email
            this.email.subscribe((v: string): void => {
                this.isEmailValid(v && isValidEmail(v));
            });
            
            // Add current user to member team
            user.ready((): void => {
                var member = this.createMember(); 
                member.user(user.data());
                member.founder = true;
                member.joined = true;
                member.locked(true); // cannot remove this member !
                this.addMember(member);
            });
            
            this.isValidDate = ko.computed((): boolean => {
                
               if(!(this.month() || '').trim()) {
                    return false;
                }
                
                var month = this.month() * 1;
                if(!(month >= 1 && month <= 12)) {
                    return false;     
                }
                
                if(!(this.year() || '').trim()) {
                    return false;
                }
                
                var year = this.year();
                if(year.length != 4 || isNaN(year)) {
                    return false;   
                }
                
                var now = new Date();
                year = year * 1;
                if(year < now.getFullYear() - 50 || year > now.getFullYear()) {
                    toast("Etes-vous certain de l'année ?");
                    return false;   
                }
                
                if(year == now.getFullYear() && month > now.getMonth() - 1) {
                    toast("Etes-vous certain du mois ?");
                    return false;    
                }
            
                return true;
 
            }).extend({ throttle: 100 });
            
        }
        
        public checkIfExists(name: string) {
        
            if(this.__jqxrCheckIfNameExists) {
                this.__jqxrCheckIfNameExists.abort();
                this.__jqxrCheckIfNameExists = null;
            }
            
            this.isCheckingName(true);
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + name,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            this.__jqxrCheckIfNameExists = $.ajax(request).complete((response, status): void => {
                this.isCheckingName(false);
                this.nameExists(response.status == 200);
            });
            
        }
           
        public prev() {
            $('#StartupAddForm').formslider('prev');
        }
        
        /**
         * Check data from screen 1
         */
        public checkScreen1(): boolean {
            
            if(!(this.name() || '').trim()) {
                toast("Veuillez renseigner un nom pour votre projet");
                return false;
            }
            
            if(this.nameExists()) {
                toast("Ce nom existe déjà :( Est-ce que vous avez déjà un compte ?");
                return false;
            }

            /*
            if(!(this.punchLine() || '').trim()) {
                toast("Renseignez votre phrase d'accroche !");
                return false;
            }
            */
            
            return true;
            
        }
        
        /**
         * Check data from screen 2
         */
        public checkScreen2(): boolean {
            
            if(!this.isValidDate()) {
                toast("Votre date de lancement ne semble pas valide");
                return false;
            }

            return true;
            
        }
        
        /**
         * Check data from screen 3
         */
        public checkScreen3(): boolean {
            
            if(!(this.email() || '').trim()) {
                toast("Veuillez renseigner l'adresse email");
                return false;
            }
            
            if(!isValidEmail(this.email())) {
                toast("Veuillez renseigner une adresse email valide ;)");
                return false;
            }

            return true;
            
        }
        
        /**
         * check form data
         */
        public checkForm(): boolean {
            
            if(!this.checkScreen1()) {
                $('#StartupAddForm').formslider('animate:0');
                return;   
            }
            
            if(!this.checkScreen2()) {
                $('#StartupAddForm').formslider('animate:1');
                return;   
            }
            
            if(!this.checkScreen3()) {
                $('#StartupAddForm').formslider('animate:2');
                return;   
            }
            
            return true;
            
        }
        
        public next(): boolean {
           
            $('#StartupAddForm').formslider('next');
            return false;
            
        }
        
        /**
         * Create a new member object
         */
        private createMember() {
            var member = {
                role: ko.observable(),
                email: ko.observable(),
                user: ko.observable(),
                locked: ko.observable(false),
                founder: false,
                joined: false
            };
            return member;
        }
        
        /**
         * Add member into team list
         */
        public addMember(member?) {
            
            var member = member || this.createMember();
            
            this.members.push(member);
            
            member.email.subscribe((s: string): void => {
                clearTimeout(this.__hdlCheckIfEmailExists);
                if(s) {
                    
                    this.__hdlCheckIfEmailExists = setTimeout((): void => {
                        
                        if(!isValidEmail(s)) {
                            toast("Merci de renseigner une adresse email valide !");
                            member.email('');
                            return;    
                        }
                        
                        if(this.isCurrentMember(s, member)) {
                            member.email('');
                            toast("Ce membre est déjà présent dans la liste");
                            return;
                        }
                        
                        user.search({ email: s }, (response, status): void => {
                            if(response.status == 200) { 
                                var data = response.responseJSON;
                                member.user(data[0]);
                            }
                        });   
                        
                    }, 2000); 
                }
            });
            
        }
        
        /**
         * Check if member is already into team list
         */
        public isCurrentMember(email, member): boolean {
            if(!email) return;
            email = email.toLowerCase();
            var members = this.members();
            for(var i = 0; i < members.length; i++) {
                var current: any = members[i];
                if(member != current) {
                    
                    if(current.user()) {
                        if(current.user().email.toLowerCase() == email) {
                            return true;    
                        }
                    } else if(current.email().toLowerCase() == email) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        /**
         * Remove member from team list
         */
        public removeMember(ind: number): void {
        
            var members = this.members();
            var member = members[ind];
            
            if(!member) return;
            
            this.members().splice(ind, 1);    

            this.members.valueHasMutated();
            
        }
        
        /**
         * Submit data
         */
        public submit(): boolean {
            
            if(!this.checkForm()) {
                return false;
            }
            
            var data: any = {
                name: this.name(),
                email: this.email(),
                punchLine: this.punchLine(),
                image: this.image(),
                startedMonth: this.month(),
                startedYear: this.year(),
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook(),
                members: []
            };
            
            $.each(this.members(), function(k, v) {
                data.members.push({
                    user_uid: v.user()?v.user().uid:null,
                    invitation_email: v.user()?v.user().email:v.email(),
                    role: v.role(),
                    founder: v.founder,
                    joined: v.joined
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
                if(response.status == 200) {
                    success("Votre espace a été créé avec succès !", "Greats !", null, (): void => {
                        document.location.href = host + 'startup/' + response.responseJSON.ref;    
                    });     
                } else {
                    error("Ho my... ! Une erreur est apparue durant la création de votre compte. Nous avons prévenu le développeur (stagiaire) qui va certainement y remédier durant la nuit !");
                }
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
    