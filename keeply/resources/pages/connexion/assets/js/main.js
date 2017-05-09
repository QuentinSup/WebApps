app.ready(function() {
	
	var oEmail = new kit.fields.EmailUIField('account.email');
	var oPassword = new kit.fields.PasswordUIField('account.password');
	var oReady = ko.observable(true);
	
	window.vm = {
		inputEmail		: oEmail,
		inputPassword	: oPassword,
		isReady			: oReady,
		fieldsValidator : new kit.FieldsValidatorDigest([
                     		oEmail,
                     		oPassword
  	                  	]),
		onSubmitHandler: function() {
			if(vm.fieldsValidator.isFormValid()) {
				
				var settings_ = {};
				settings_["email"] 			= vm.inputEmail.dataValue();
				settings_["password"] 		= vm.inputPassword.dataValue();
				
				kit.helpers.Query.PUT(app.servicesPath + "account/connect", settings_, function(data, status) {
					if(status == kit.helpers.Query.Status.SUCCESS) {
						app.navigateTo(app.servicesPath + '/pages/account');
					}
				});
			}
			
		}
	};


	ko.applyBindings(vm);
});