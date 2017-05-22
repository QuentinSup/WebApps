module startupfollows.startup {
    
    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;
    declare var user;
    
    class Model {
        
        public data = ko.observable();
        public stories = ko.observableArray();
        public isFollowedByUser = ko.observable(false);
        
        public constructor() {
         
            this.data.subscribe((s: any): void => {
                this.listStories();
                
                user.ready((user: any): void => {
                    if(user.isFollowingStartup(s.uid)) {
                        this.isFollowedByUser(true);
                    }
                });
                
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
                    this.stories(ko.mapping.fromJS(response.responseJSON)());
                 }
            });    
        } 
        
        public addStoryLike(uid: string, index: number): void {
            
            user.likeStory(uid, (response, status): void => {
                 if(response.status == 204) {
                    this.stories()[index].numberOfLikes((this.stories()[index].numberOfLikes()*1)+1);
                 }
            });

        }
        
        public follow(): void {
            user.follow(this.data().uid, (response, status): void => {
                if(response.status == 204) {
                    this.isFollowedByUser(true);
                }   
            });
        }
        
        public unfollow(): void {
            user.unfollow(this.data().uid, (response, status): void => {
                if(response.status == 204) {
                    this.isFollowedByUser(false);
                }    
            });
        }
        
    }
    
    
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
    
}
    