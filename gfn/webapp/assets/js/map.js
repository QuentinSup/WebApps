(function($) {

	var loading = ko.observable(false);

	var regionsData = {};
	var model = {
		countries : ko.observableArray(),
		countrySearch : ko.observable(),
		selectedCountry : ko.observable(),
		region : ko.observable(),
		globalOvershootDay : ko.observable(),
		globalOvershootDayString : ko.observable()
	};

	model.globalOvershootDay.subscribe(function(d) {
		model.globalOvershootDayString(buildOvershootDayString(d));
		$('#globalOvershootDay').show('slow');
		$('#preloader').hide('slow');
		$('#loading').hide('slow');
	});
	
	model.selectedCountry.subscribe(function(country) {
		if(!country) return;
		loadRegionData(country.toUpperCase());
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

	$(document).on('click', '#regions_detail .close', function() {
		hideDetails();
	});

	function loadEarths() {
		$.get('api/data/earths/2013').done(function(jsonArray) {
			var countries = [];
			var data = [ [ 'Pays', 'Number of earths' ] ];
			var nbEarthsTot = 0;
			var nbEarthsCount = 0;
			$.each(jsonArray, function(k, v) {
				var countryName = v.countryName;
				var nbEarths = v.value;
				var year = v.year;
				var iso = v.isoa2;
				
				if(iso) {
				
					data.push([ {
						v : iso,
						f : countryName
					}, Math.round(nbEarths * 10) / 10 ]);

					regionsData[iso] = {
						countryName : countryName,
						numberOfEarths : nbEarths,
						iso : iso,
						countryCode : v.countryCode,
						data : ko.observable(),
						records : ko.observable(),
						isDataLoaded : ko.observable(false),
						isRecordsLoaded : ko.observable(false)
					};
				
					countries.push({
						key: iso,
						value: countryName
					});

				}
				
				if(nbEarths > 0) {
						nbEarthsTot += nbEarths;
						nbEarthsCount++;
				}

			});

			var d = calculateOvershootDay(nbEarthsTot / nbEarthsCount);
			model.globalOvershootDay(d);
			
			model.countries(countries);

			drawRegionsMap(data);
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
			model.countrySearch(regionData.countryName);
			loadRegionRecords(regionData.iso);

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
					.css('height', '100%');
			}, 100);
		}, timeout)
	}

	function loadRegionRecords(iso, record) {
		var record = record || 'earth';
		var regionData = regionsData[iso];

		if (regionData.isRecordsLoaded()) {
			drawRecords(regionData.records());
		} else {

			loading(true);

			$.get('api/data/country/' + regionData.countryCode + '/all/' + record).done(function(jsonArray) {

				var data = [];

				$.each(jsonArray, function(k, v) {
					data.push([ '' + v.year, v.value, v.value ]);
				});

				regionData.records(data);
				regionData.isRecordsLoaded(true);

				drawRecords(data);

			}).always(function() {
				loading(false);
			});
		}

	}

	function drawRecords(data) {
		var map = new google.visualization.DataTable();

		map.addColumn('string', 'Year');
		map.addColumn('number', 'Value');
		map.addColumn('number', 'Earths');

		map.addRows(data);

		var opts = {
			backgroundColor : 'transparent',
			animation : {
				duration : 2000,
				startup : true,
				easing : 'inAndOut'
			},
			chartArea : {
				width : '90%',
				height : '200px'
			},
			curveType : 'function',
			legend : 'none',
			series : {
				0 : {
					// set any applicable options on the first series
				},
				1 : {
					// set the options on the second series
					lineWidth : 0,
					pointSize : 5,
					visibleInLegend : false
				}
			},
			vAxis : {
				baselineColor : '#fff',
				textStyle : {
					color : '#efefef'
				},
				gridlines : {
					color : '#404040'
				}
			},
			hAxis : {
				baselineColor : '#fff',
				textStyle : {
					color : '#efefef'
				},
				format : '####',
				gridlines : {
					color : '#404040'
				}
			}
		}

		var chart = new google.visualization.LineChart(document.getElementById('regions_detail_records'));

		chart.draw(map, opts);
	}

	function loadRegionData(iso) {
		var regionData = regionsData[iso];

		if (regionData.isDataLoaded()) {
			showDetails(regionData);
		} else {

			hideDetails();

			loading(true);

			$.get('api/data/country/' + regionData.countryCode + '/2013').done(function(jsonArray) {
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
				/*
				console.info("[", countryName, "]");
				console.log("EFc = " + EFc);
				console.log("BiocapPerCap = " + BiocapPerCap);
				console.log("EFExportsPerCap = " + EFe);
				console.log("EFImportsPerCap = " + EFi);
				console.log("EFProdPerCap = " + EFProdPerCap);
				console.log("EFConsPerCap = " + EFConsPerCap);
				console.log("BiocapPerCap - EFConsPerCap = " + (BiocapPerCap - EFConsPerCap));
				console.log("nbEarths = " + nbEarths);
				console.log("nbEarths = " + EFConsPerCap / 1.72);
				console.log("nbEarths relative to Biocap = " + ((BiocapPerCap - EFConsPerCap) / 1.72));
				*/
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

	google.charts.load('current', {
		'packages' : [ 'geochart', 'corechart' ],
		// Note: you will need to get a mapsApiKey for your project.
		// See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
		'mapsApiKey' : 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
	});
	google.charts.setOnLoadCallback(loadEarths);

	function selectHandler(r) {
		loadRegionData(r.region);
	}

	var regionsMapData;

	function drawRegionsMap(data) {
		regionsMapData = data;

		var chart = redrawChart();

	}

	function redrawChart() {
		if (!regionsMapData) return;

		var map = google.visualization.arrayToDataTable(regionsMapData);
		var options = {
			backgroundColor : {
				fill : '#607D8B'
			},
			magnifyingGlass : {
				enable : true,
				zoomFactor : 7.5
			},
			markerOpacity : .5,
			legend : 'none',
			sizeAxis : {
				minValue : 0,
				maxSize : 20
			},
			colorAxis : {
				colors : [ 'green', '#72cc18', '#f4aa42', '#f47441', '#cc3318', '#bf2a28', 'red' ],
				values : [ 0, 1, 1.5, 2, 4, 6, 7 ]
			}
		};
		var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

		chart.draw(map, options);

		google.visualization.events.addListener(chart, 'regionClick', selectHandler);

		return chart;

	}

	var resizeHandler;

	//create trigger to resizeEnd event     
	$(window).resize(function() {
		if (resizeHandler) clearTimeout(resizeHandler);
		resizeHandler = setTimeout(function() {
			$(this).trigger('resizeEnd');
		}, 500);
	});

	//redraw graph when window resize is completed  
	$(window).on('resizeEnd', function() {
		redrawChart();
	});


})(jQuery);