var error = function(message, title, opts, callback) {

	var options = $.extend({}, {
		title : title || "Oups !",
		text : message,
		type : "error",
		confirmButtonText : "Try again !"
	});

	if (opts) {
		$.extend(options, opts);
	}

	swal(options, callback);

};

var success = function(message, title, opts, callback) {

	var options = $.extend({}, {
		title : title || "Yeah !",
		text : message,
		type : "success",
		confirmButtonText : "Cool !"
	});

	if (opts) {
		$.extend(options, opts);
	}

	swal(options, callback);

};

var toast = function(message, opts) {
	
	var options = $.extend({}, {
	    //id: '',
	    //'class': '',
	    title: '',
	    //titleColor: '',
	    //titleSize: '',
	    //titleLineHeight: '',
	    message: message,
	    //messageColor: '',
	    //messageSize: '',
	    //messageLineHeight: '',
	    //backgroundColor: '',
	    color: 'dark', // blue, red, green, yellow
	    icon: 'icon-contacts',
	    //iconText: '',
	    iconColor: 'rgb(0, 255, 184)',
	    image: host + 'assets/img/logo.jpg',
	    imageWidth: 70,
	    //maxWidth: null,
	    //zindex: null,
	    layout: 2,
	    //balloon: false,
	    //close: true,
	    //rtl: false,
	    position: 'topCenter', //bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
	    //target: '',
	    //targetFirst: true,
	    //timeout: 10000,
	    //drag: true,
	    pauseOnHover: true,
	    resetOnHover: true,
	    progressBar: true,
	    progressBarColor: '#007AB8',
	    //animateInside: true,
	    //buttons: {},
	    transitionIn: 'flipInX',
	    transitionOut: 'flipOutX',
	    transitionInMobile: 'fadeInUp',
	    transitionOutMobile: 'fadeOutDown'
	    //onOpen: function () {},
	    //onClose: function () {}
	});
	
	if (opts) {
		$.extend(options, opts);
	}
	
	iziToast.show(options);


};

var isValidEmail = function(emailAddress) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
};

(function() {

	// Init global DOM elements, functions and arrays
	window.app = {
		el : {},
		fn : {}
	};
	app.el['window'] = $(window);
	app.el['document'] = $(document);
	app.el['back-to-top'] = $('.back-to-top');
	app.el['html-body'] = $('html,body');
	app.el['loader'] = $('#loader');
	app.el['mask'] = $('#mask');

	app.fn.screenSize = function() {
		var size,
			width = app.el['window'].width();
		if (width < 320)
			size = "Not supported";
		else if (width < 480)
			size = "Mobile portrait";
		else if (width < 768)
			size = "Mobile landscape";
		else if (width < 960)
			size = "Tablet";
		else
			size = "Desktop";
		if (width < 768) {
			$('.animated').removeClass('animated').removeClass('hiding');
		}
	// $('#screen').html( size + ' - ' + width );
	// console.log( size, width );
	};

	$(function() {
		
		// French
		jQuery.timeago.settings.strings = {
		   // environ ~= about, it's optional
		   prefixAgo: "il y a",
		   prefixFromNow: "d'ici",
		   seconds: "moins d'une minute",
		   minute: "environ une minute",
		   minutes: "environ %d minutes",
		   hour: "environ une heure",
		   hours: "environ %d heures",
		   day: "environ un jour",
		   days: "environ %d jours",
		   month: "environ un mois",
		   months: "environ %d mois",
		   year: "un an",
		   years: "%d ans"
		};
		
		//Preloader
		app.el['loader'].delay(700).fadeOut();
		app.el['mask'].delay(1200).fadeOut("slow");

		// Resized based on screen size
		app.el['window'].resize(function() {
			app.fn.screenSize();
		});

		// fade in .back-to-top
		$(window).scroll(function() {
			if ($(this).scrollTop() > 500) {
				app.el['back-to-top'].fadeIn();
			} else {
				app.el['back-to-top'].fadeOut();
			}
		});

		// scroll body to 0px on click
		app.el['back-to-top'].click(function() {
			app.el['html-body'].animate({
				scrollTop : 0
			}, 1500);
			return false;
		});

		$('#mobileheader').html($('#header').html());

		function heroInit() {
						
			var hero = jQuery('#hero'),
				winHeight = jQuery(window).height(),
				heroHeight = winHeight;

			hero.css({
				height : heroHeight + "px"
			});
		}
		
		$(window).on("resize", heroInit);
		$(document).on("ready", heroInit);
		$(document).on("unsyncready", heroInit);

		$(document).on("ready", function() {
			setTimeout(function() {
				$('*[title]').tooltipster();
			}, 1000);
		});
		
		$('.navigation-bar').onePageNav({
			currentClass : 'active',
			changeHash : true,
			scrollSpeed : 500,
			scrollThreshold : 0.5,
			easing : 'swing'
		});

		$('.animated').appear(function() {
			var element = $(this);
			var animation = element.data('animation');
			var animationDelay = element.data('delay');
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
		}, {
			accY : -150
		});

		$('#header').waypoint('sticky', {
			wrapper : '<div class="sticky-wrapper" />',
			stuckClass : 'sticky'
		});

		$('.fancybox').fancybox();

	});

// ****** GOOGLE MAP *******
/*
var map;
var servan = new google.maps.LatLng(45.1853666,5.7316135);
			
var MY_MAPTYPE_ID = 'custom_style';
			
function initialize() {
			
	var featureOpts = [
		{
			stylers: [
				{ saturation: -20 },
				{ lightness: 40 },
				{ visibility: 'simplified' },
				{ gamma: 0.8 },
				{ weight: 0.4 }
			]
		},
		{
			elementType: 'labels',
			stylers: [
				{ visibility: 'on' }
			]
		},
		{
			featureType: 'water',
			stylers: [
				{ color: '#dee8ff' }
			]
		}
	];
			
	var mapOptions = {
		zoom: 17,
		scrollwheel: false,
		panControl: false,
		mapTypeControl: false,
  			streetViewControl: false,
		center: new google.maps.LatLng(45.1853666,5.7316135),
		mapTypeControlOptions: {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
		},
		mapTypeId: MY_MAPTYPE_ID
	};
			
	map = new google.maps.Map(document.getElementById('canvas-map'),mapOptions);
	var image = 'assets/img/pmarker.png';
	var myLatLng = new google.maps.LatLng(45.1853666,5.7316135);
	var beachMarker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		icon: image
	});
	var styledMapOptions = {
		name: 'Custom Style'
	};
			
	var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
			
	map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}
			
google.maps.event.addDomListener(window, 'load', initialize); 
*/
})();