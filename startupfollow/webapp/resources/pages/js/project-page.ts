module colaunch {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    declare function success(message, title?, opts?);
    declare function error(message, title?, opts?);
    declare function toast(message, opts?);
    
    class Model {
        
        public data = ko.observable();
        public stories = ko.observableArray();
        public events = ko.observableArray();
        public isFollowedByUser = ko.observable(false);
        public isLoadingData = ko.observable(true);
        public isLoadingStories = ko.observable(true);
        
        public constructor() {
         
            this.stories.subscribe((): void => {
                setTimeout(function() {
                    $('#stories .timeago').timeago();
                }, 100);   
            });
            
            this.data.subscribe((s: any): void => {
                
                this.listStories();
                this.listEvents();
                
                user.ready((user: any): void => {
                    if(user.isFollowingStartup(s.uid)) {
                        this.isFollowedByUser(true);
                    }
                    
                    if(user.canManageStartup(s.uid)) {
                        if(s.lastActivityInDays == -1) {
                            toast("Vous n'avez pas encore partagé de vos nouvelles. <a href=\"" + host +  "storify/" + s.ref + "\">Commencez maintenant !</a>", { title: 'Bonjour <strong>' + user.data().name + '</strong>', timeout: false, progressBar: false, bubble: true });
                        } else if(s.lastActivityInDays > 30) {
                            toast("Celà fait " + s.lastActivityInDays + " jours que vous avez partagé votre dernière avancée. <a href=\"" + host +  "storify/" + s.ref + "\">Commencez maintenant !</a>", { title: 'Bonjour <strong>' + user.data().name + '</strong>', timeout: false, progressBar: false, bubble: true });
                        }
                    }
                    
                });
                
                
                
            });
                      
            
            
        }
        
        public find(id: string) {
        
            this.isLoadingData(true);
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + id,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                
                this.isLoadingData(false);
                
                if(response.status == 200) {
                    this.data(response.responseJSON);
                } else {
                    throw "Startup introuvable";
                }
                
                $(document).trigger('unsyncready');
                
            });
            
        }
        
        public listStories(): void {
            
            this.isLoadingStories(true);
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.data().uid + '/story/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                this.isLoadingStories(false);
                 if(response.status == 200) {
                    this.stories(ko.mapping.fromJS(response.responseJSON)());
                 }
            });    
        } 
        
        public listEvents(): void {
            
            var request = {
                type: 'get',
                url: host + 'rest/startup/' + this.data().uid + '/event/all',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json' 
            };
            
            $.ajax(request).complete((response, status): void => {
                 if(response.status == 200) {
                    this.events(ko.mapping.fromJS(response.responseJSON)());
                 }
            });    
        } 
        
        public addStoryLike(uid: string, index: number): void {
            
            user.likeStory(uid, (response, status): void => {
                 if(response.status == 204) {
                    this.stories()[index].numberOfLikes((this.stories()[index].numberOfLikes()*1)+1);
                 } else {
                 
                     error("Mince, une erreur est apparue et nous n'avons pas pu vous permettre d'aimer cette news ;(");
                     
                 }
            });

        }
        
        public follow(): void {
            user.follow(this.data().uid, (response, status): void => {
                if(response.status == 204) {
                    this.isFollowedByUser(true);
                    
                    toast("Vous suivez désormais " + this.data().name, { title: 'Félicitations!', image: this.data().image || (host + 'assets/img/logo.jpg') });
                    
                } else {

                    error("Mince, une erreur est apparue et nous n'avons pas pu vous permettre de suivre cette startup ;("); 
                    
                }
            });
        }
        
        public unfollow(): void {
            user.unfollow(this.data().uid, (response, status): void => {
                if(response.status == 204) {
                    this.isFollowedByUser(false);
                    
                    toast("Vous ne suivez plus " + this.data().name, { title: 'Dommage!', image: this.data().image || (host + 'assets/img/logo.jpg') });
                    
                } else { 
                    error("Mince, une erreur est apparue et nous n'avons pas pu vous désinscrire de cette startup ;(");
                } 
                    
            });
        }
        
    }
    
    
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
    
}
    