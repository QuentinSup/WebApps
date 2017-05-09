app.ready(function() {
	
	var oName = ko.observable();
	var oEmail = ko.observable();
	var oAdr1 = ko.observable();
	var oAdr2 = ko.observable();
	var oPostalCode = ko.observable();
	var oCity = ko.observable();
	var oIsReady = ko.observable(false);
	
	window.vm = {
		oName			: oName,
		oEmail			: oEmail,
		oAdr1			: oAdr1,
		oAdr2			: oAdr2,
		oPostalCode		: oPostalCode,
		oCity			: oCity,
		isReady			: oIsReady
	};

	kit.helpers.Query.GET(app.servicesPath + "ufo/profil", function(data, status) {
		if(status == kit.helpers.Query.Status.SUCCESS) {
			vm.oName(data.firstName + ' ' + data.name);
			vm.oEmail(data.email);
			vm.oAdr1(data.adr_1);
			vm.oAdr2(data.adr_2);
			vm.oPostalCode(data.postal_code);
			vm.oCity(data.city);
		}	
		vm.isReady(true);
	});

	
	ko.applyBindings(vm);
});