var colaunch;
(function (colaunch) {
    var StartupAddForm = (function () {
        /**
         * Constructor
         */
        function StartupAddForm() {
            var _this = this;
            this.name = ko.observable();
            this.punchLine = ko.observable();
            this.email = ko.observable();
            this.image = ko.observable();
            this.website = ko.observable();
            this.twitter = ko.observable();
            this.facebook = ko.observable();
            this.members = ko.observableArray();
            this.nameExists = ko.observable(true);
            this.isEmailValid = ko.observable(false);
            this.isCheckingName = ko.observable(false);
            // Prepare name control
            this.name.subscribe(function (v) {
                _this.nameExists(true);
                clearTimeout(_this.__hdlCheckIfNameExists);
                if (!v)
                    return;
                _this.__hdlCheckIfNameExists = setTimeout(function () {
                    _this.checkIfExists(v);
                }, 500);
            });
            // Autovalidate email
            this.email.subscribe(function (v) {
                _this.isEmailValid(v && isValidEmail(v));
            });
            // Add current user to member team
            user.ready(function () {
                var member = _this.createMember();
                member.user(user.data());
                member.founder = true;
                member.joined = true;
                member.locked(true); // cannot remove this member !
                _this.addMember(member);
            });
        }
        StartupAddForm.prototype.checkIfExists = function (name) {
            var _this = this;
            if (this.__jqxrCheckIfNameExists) {
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
            this.__jqxrCheckIfNameExists = $.ajax(request).complete(function (response, status) {
                _this.isCheckingName(false);
                _this.nameExists(response.status == 200);
            });
        };
        StartupAddForm.prototype.prev = function () {
            $('#StartupAddForm').formslider('prev');
        };
        /**
         * Check data from screen 1
         */
        StartupAddForm.prototype.checkScreen1 = function () {
            if (!(this.name() || '').trim()) {
                toast("Veuillez renseigner un nom pour votre projet");
                return false;
            }
            if (this.nameExists()) {
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
        };
        /**
         * Check data from screen 2
         */
        StartupAddForm.prototype.checkScreen2 = function () {
            if (!(this.email() || '').trim()) {
                toast("Veuillez renseigner l'adresse email");
                return false;
            }
            if (!isValidEmail(this.email())) {
                toast("Veuillez renseigner une adresse email valide ;)");
                return false;
            }
            return true;
        };
        /**
         * check form data
         */
        StartupAddForm.prototype.checkForm = function () {
            if (!this.checkScreen1()) {
                $('#StartupAddForm').formslider('animate:0');
                return;
            }
            if (!this.checkScreen2()) {
                $('#StartupAddForm').formslider('animate:1');
                return;
            }
            return true;
        };
        StartupAddForm.prototype.next = function () {
            if (this.checkForm()) {
                $('#StartupAddForm').formslider('next');
                return true;
            }
            return false;
        };
        /**
         * Create a new member object
         */
        StartupAddForm.prototype.createMember = function () {
            var member = {
                role: ko.observable(),
                email: ko.observable(),
                user: ko.observable(),
                locked: ko.observable(false),
                founder: false,
                joined: false
            };
            return member;
        };
        /**
         * Add member into team list
         */
        StartupAddForm.prototype.addMember = function (member) {
            var _this = this;
            var member = member || this.createMember();
            this.members.push(member);
            member.email.subscribe(function (s) {
                clearTimeout(_this.__hdlCheckIfEmailExists);
                if (s) {
                    _this.__hdlCheckIfEmailExists = setTimeout(function () {
                        if (!isValidEmail(s)) {
                            toast("Merci de renseigner une adresse email valide !");
                            member.email('');
                            return;
                        }
                        if (_this.isCurrentMember(s, member)) {
                            member.email('');
                            toast("Ce membre est déjà présent dans la liste");
                            return;
                        }
                        user.search({ email: s }, function (response, status) {
                            if (response.status == 200) {
                                var data = response.responseJSON;
                                member.user(data[0]);
                            }
                        });
                    }, 2000);
                }
            });
        };
        /**
         * Check if member is already into team list
         */
        StartupAddForm.prototype.isCurrentMember = function (email, member) {
            if (!email)
                return;
            email = email.toLowerCase();
            var members = this.members();
            for (var i = 0; i < members.length; i++) {
                var current = members[i];
                if (member != current) {
                    if (current.user()) {
                        if (current.user().email.toLowerCase() == email) {
                            return true;
                        }
                    }
                    else if (current.email().toLowerCase() == email) {
                        return true;
                    }
                }
            }
            return false;
        };
        /**
         * Remove member from team list
         */
        StartupAddForm.prototype.removeMember = function (ind) {
            var members = this.members();
            var member = members[ind];
            if (!member)
                return;
            this.members().splice(ind, 1);
            this.members.valueHasMutated();
        };
        /**
         * Submit data
         */
        StartupAddForm.prototype.submit = function () {
            if (!this.checkForm()) {
                return false;
            }
            var data = {
                name: this.name(),
                email: this.email(),
                punchLine: this.punchLine(),
                image: this.image(),
                link_twitter: this.twitter(),
                link_website: this.website(),
                link_facebook: this.facebook(),
                members: []
            };
            $.each(this.members(), function (k, v) {
                data.members.push({
                    user_uid: v.user() ? v.user().uid : null,
                    invitation_email: v.user() ? v.user().email : v.email(),
                    role: v.role(),
                    founder: v.founder,
                    joined: v.joined
                });
            });
            var request = {
                type: 'post',
                url: host + 'rest/startup',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            };
            $.ajax(request).complete(function (response, status) {
                if (response.status == 200) {
                    success("Votre espace a été créé avec succès !", "Greats !", null, function () {
                        document.location.href = host + 'startup/' + response.responseJSON.ref;
                    });
                }
                else {
                    error("Ho my... ! Une erreur est apparue durant la création de votre compte. Nous avons prévenu le développeur (stagiaire) qui va certainement y remédier durant la nuit !");
                }
            });
            return false;
        };
        return StartupAddForm;
    })();
    var Model = (function () {
        function Model() {
            this.form = new StartupAddForm();
        }
        return Model;
    })();
    window.model = new Model();
    ko.applyBindings(window.model, $('#app')[0]);
})(colaunch || (colaunch = {}));
//# sourceMappingURL=get-started.js.map