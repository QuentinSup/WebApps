(function($) {

	var loading = ko.observable(false);

	var regionsData = {};
	var model = {
		selectedCountry: ko.observable(),
		region: ko.observable(),
		countries : ko.observableArray(),
		globalOvershootDay : ko.observable(),
		globalOvershootDayString : ko.observable()
	};

	model.globalOvershootDay.subscribe(function(d) {
		model.globalOvershootDayString(buildOvershootDayString(d));
		$('#globalOvershootDay').show('slow');
		$('#preloader').hide('slow');
		$('#loading').hide('slow');
	});
	
	model.region.subscribe(function(data) {
		model.globalOvershootDayString(buildOvershootDayString(data.overshootDate));
	});
	
	model.selectedCountry.subscribe(function(country) {
		loadRegionData(country.key);
	});
	
	ko.applyBindings(model, $('#view')[0]);

	loading.subscribe(function(b) {
		if (b) {
			$('#loading').show(200);
			$('#preloader').show(400);
		} else {
			$('#loading').hide(200);
			$('#preloader').hide(400);
		}
	});

	function loadEarths() {
		$.get('http://localhost:8080/gfn/api/data/earths/2013').done(function(jsonArray) {
			var countries = [];
			var nbEarthsTot = 0;
			var nbEarthsCount = 0;
			$.each(jsonArray, function(k, v) {
				var countryName = v.countryName;
				var nbEarths = v.value;
				var year = v.year;
				var iso = v.isoa2;
				
				regionsData[iso] = {
					countryName : countryName,
					numberOfEarths : nbEarths,
					iso : iso,
					countryCode : v.countryCode,
					data : ko.observable(),
					records : ko.observable(),
					overshootDate: calculateOvershootDay(nbEarths),
					isDataLoaded : ko.observable(false)
				};
				
				countries.push({
					key: iso,
					value: countryName
				});

				nbEarthsTot += nbEarths;
				nbEarthsCount++;

			});

			var d = calculateOvershootDay(nbEarthsTot / nbEarthsCount);
			model.globalOvershootDay(d);

			model.countries(countries);
			
			
		});

	}

	function hideDetails() {
		$('#regions_detail')
			.css('transition', 'opacity 1s, height 1s')
			.css('opacity', '0')
			.css('height', '0');
	}

	function showDetails(regionData) {
		var timeout = 0;
		if ($('#regions_detail').is(':visible')) {
			hideDetails();
			timeout = 1000;
		}
		setTimeout(function() {

			model.region(regionData);

			$('#regions_detail .animated').each(function() {
				var element = $(this);
				var animation = element.data('animation');
				var animationDelay = element.data('delay');
				element.addClass('hiding').removeClass(animation + " visible");
				if (animationDelay) {
					setTimeout(function() {
						element.addClass(animation + " visible");
						element.removeClass('hiding');
						if (element.hasClass('counter')) {
							element.find('.value').countTo();
						}
					}, animationDelay);
				} else {
					element.addClass(animation + " visible");
					element.removeClass('hiding');
					if (element.hasClass('counter')) {
						element.find('.value').countTo();
					}
				}
			});

			setTimeout(function() {
				$('#regions_detail')
					.css('transition', 'opacity 2s, height 2s')
					.css('opacity', '1')
					.css('height', '80%');
			}, 100);
		}, timeout)
	}

	function loadRegionData(iso) {
		var regionData = regionsData[iso];

		if (regionData.isDataLoaded()) {
			showDetails(regionData);
		} else {

			hideDetails();

			loading(true);

			$.get('http://localhost:8080/gfn/api/data/country/' + regionData.countryCode + '/2013').done(function(jsonArray) {
				var EFi = 0;
				var EFe = 0;
				var EFc = 0;
				var year = 0;
				var BiocapPerCap = 0;
				var EFProdPerCap = 0;
				var EFConsPerCap = 0;
				var nbEarths = 0;
				var countryName = '';
				var iso = '';
				$.each(jsonArray, function(k, v) {

					countryName = v.countryName;
					year = v.year;
					iso = v.isoa2;

					if (v.record == 'Earths') {
						nbEarths = v.value;
					}
					if (v.record == 'BiocapPerCap') {
						BiocapPerCap = v.value;
					}
					if (v.record == 'EFExportsPerCap') {
						EFe = v.value;
					}
					if (v.record == 'EFImportsPerCap') {
						EFi = v.value;
					}
					if (v.record == 'EFProdPerCap') {
						EFProdPerCap = v.value;
					}
					if (v.record == 'EFConsPerCap') {
						EFConsPerCap = v.value;
					}

				});
				EFc = EFProdPerCap + EFi - EFe;

				var d = calculateOvershootDay(nbEarths);

				var overshootDate = d;
				var overshootDayString = buildOvershootDayString(overshootDate);

				var data = {
					countryName : countryName,
					BiocapPerCap : Math.round(BiocapPerCap * 10) / 10,
					EFExportsPerCap : Math.round(EFe * 10) / 10,
					EFImportsPerCap : Math.round(EFi * 10) / 10,
					EFProdPerCap : Math.round(EFProdPerCap * 10) / 10,
					EFConsPerCap : Math.round(EFConsPerCap * 10) / 10,
					numberOfEarths : Math.round(nbEarths * 10) / 10,
					overshootDay : overshootDate,
					overshootDayString : overshootDayString
				};

				regionData.data(data);
				regionData.isDataLoaded(true);

				showDetails(regionData);

			}).always(function() {
				loading(false);
			});
		}
	}
	
	loadEarths();

})(jQuery);