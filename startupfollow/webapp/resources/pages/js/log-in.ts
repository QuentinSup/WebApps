module startupfollows.startup {

    declare var projects;
    declare var ko;
    declare var $;
    declare var window;
    declare var host;

    class Model {

        public name = ko.observable();
        public password = ko.observable();
        public redirectTo = ko.observable();

        public constructor() {


        }

        public login() {

            var data = {
                name: this.name(),
                password: this.password()    
            }
            
            var request = {
                type: 'post',
                url: host + 'rest/user/auth',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };

            $.ajax(request).complete((response, status): void => {
                if (response.status == 200) {
                    document.location.href = host + this.redirectTo() || '';
                }
            });

        }

    }


    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);

}
