app.ready(function() {
	
	var oName = new kit.fields.TextUIField('account.name');
	var oFirstName = new kit.fields.TextUIField('account.firstName');
	var oEmail = new kit.fields.EmailUIField('account.email');
	var oIsReady = ko.observable(false);
	var oId = ko.observable();
	
	window.vm = {
		hiddenId		: oId,
		inputName		: oName,
		inputFirstName	: oFirstName,
		inputEmail		: oEmail,
		isReady			: oIsReady,
		fieldsValidator : new kit.FieldsValidatorDigest([
                     		oName,
                     		oFirstName,
                     		oEmail
  	                  	]),
		onSubmitHandler: function() {
			if(vm.fieldsValidator.isFormValid()) {
				
				var settings_ = {};
				settings_["id"] 			= vm.hiddenId();
				settings_["name"] 			= vm.inputName.dataValue();
				settings_["firstName"] 		= vm.inputFirstName.dataValue();
				settings_["email"] 			= vm.inputEmail.dataValue();
				
				kit.helpers.Query.PUT(app.servicesPath + "account", settings_, function(data, status) {});
			}
			
		}
	};
	
	
	kit.helpers.Query.GET(app.servicesPath + "account", function(data, status) {
		if(status == kit.helpers.Query.Status.SUCCESS) {
			vm.hiddenId(data.id);
			vm.inputName.forceValue(data.name);
			vm.inputFirstName.forceValue(data.firstName);
			vm.inputEmail.forceValue(data.email);
			vm.isReady(true);
		}	
	});

	ko.applyBindings(vm);
});