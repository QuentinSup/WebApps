app.ready(function() {
	
	var oName 			= new kit.fields.TextUIField('account.name');
	var oFirstName 		= new kit.fields.TextUIField('account.firstName');
	var oEmail 			= new kit.fields.EmailUIField('account.email');
	var oConfirmEmail 	= new kit.fields.EmailUIField('account.confirmEmail');
	var oPassword 		= new kit.fields.PasswordUIField('account.password');
	var oConfirmPassword = new kit.fields.PasswordUIField('account.confirmPassword');
	var oIsReady = ko.observable(false);
	
	oConfirmEmail.addConstraint('equality', function() {
		return this.dataValue() == oEmail.dataValue();
	});
	
	oConfirmPassword.addConstraint('equality', function() {
		return this.dataValue() == oPassword.dataValue();
	});
	
	window.vm = {
		inputName		: oName,
		inputFirstName	: oFirstName,
		inputEmail		: oEmail,
		inputConfirmEmail: oConfirmEmail,
		inputPassword			: oPassword,
		inputConfirmPassword	: oConfirmPassword,
		isReady					: oIsReady,
		fieldsValidator : new kit.FieldsValidatorDigest([
                     		oName,
                     		oFirstName,
                     		oEmail,
                     		oConfirmEmail,
                     		oPassword,
                     		oConfirmPassword
  	                  	]),
		onSubmitHandler: function() {
			if(vm.fieldsValidator.isFormValid()) {
				
				var settings_ = {};				
				settings_["name"] 			= vm.inputName.dataValue();
				settings_["firstName"] 		= vm.inputFirstName.dataValue();
				settings_["email"] 			= vm.inputEmail.dataValue();
				settings_["password"] 		= vm.inputPassword.dataValue();
				
				kit.helpers.Query.POST(app.servicesPath + "account", settings_, function(data, status) {
					if(status == kit.helpers.Query.Status.SUCCESS) {
						app.navigateTo(app.servicesPath + "/pages/connexion");
					}
				});
			}
			
		}
	};
	

	
	vm.isReady(true);

	ko.applyBindings(vm);
});