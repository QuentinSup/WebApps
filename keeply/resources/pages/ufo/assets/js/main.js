app.ready(function() {
	
	var oAdr1 = new kit.fields.TextUIField('ufo.adr_1');
	var oAdr2 = new kit.fields.TextUIField('ufo.adr_2');
	var oPostalCode = new kit.fields.TextUIField('ufo.postal_code');
	var oCity = new kit.fields.TextUIField('ufo.city');
	var oId = ko.observable();
	var oIsReady = ko.observable(false);
	
	window.vm = {
		hiddenId		: oId,
		inputAdr1		: oAdr1,
		inputAdr2		: oAdr2,
		inputPostalCode	: oPostalCode,
		inputCity		: oCity,
		isReady			: oIsReady,
		fieldsValidator : new kit.FieldsValidatorDigest([
                     		oAdr1,
                     		oAdr2,
                     		oPostalCode,
                     		oCity
  	                  	]),
		onSubmitHandler: function() {
			if(vm.fieldsValidator.isFormValid()) {
				
				var settings_ = {};
				settings_["id"] 			= vm.hiddenId();
				settings_["adr_1"] 			= vm.inputAdr1.dataValue();
				settings_["adr_2"] 			= vm.inputAdr2.dataValue();
				settings_["postal_code"] 	= vm.inputPostalCode.dataValue();
				settings_["city"] 			= vm.inputCity.dataValue();
				
				if(vm.hiddenId()) {
					kit.helpers.Query.PUT(app.servicesPath + "ufo", settings_, function(data, status) {});
				} else {
					kit.helpers.Query.POST(app.servicesPath + "ufo", settings_, function(data, status) {
						if(status == kit.helpers.Query.Status.SUCCESS) {
							vm.hiddenId(data.id);
						}
					});
				}
			}
			
		}
	};

	vm.inputAdr2.showLabel(false);
	vm.inputAdr2.isRequired(false);
	
	kit.helpers.Query.GET(app.servicesPath + "ufo", function(data, status) {
		if(status == kit.helpers.Query.Status.SUCCESS) {
			vm.hiddenId(data.id);
			vm.inputAdr1.forceValue(data.adr_1);
			vm.inputAdr2.forceValue(data.adr_2);
			vm.inputPostalCode.forceValue(data.postal_code);
			vm.inputCity.forceValue(data.city);
		}	
		vm.isReady(true);
	});

	
	ko.applyBindings(vm);
});