app.ready(function() {
	

	window.vm = {
		isReady: ko.observable(true)
	};

	ko.applyBindings(vm);
});