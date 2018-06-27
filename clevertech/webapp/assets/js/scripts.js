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

	
	
	window.scrollTo = function(el, delay) {
		app.el['html-body'].animate({
			scrollTop : $(el).offset().top
		}, delay || 1500);
	};
	
	window.windowHeight = function() {
					
		var winHeight = $(window).outerHeight();

		$('.window-height').css({
			'height' : winHeight + "px"
		});
		
		$('.nano').nanoScroller();
		
	};

	$(function() {
		
		//Preloader
		app.el['loader'].delay(700).fadeOut();
		app.el['mask'].delay(1200).fadeOut("slow");

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
			scrollTo('#index', 1500);
			return false;
		});
		
		$(window).on("resize", windowHeight);
		$(document).on("ready", windowHeight);
		$(document).on("unsyncready", function() {
			windowHeight();
		});

		windowHeight();
		
		setTimeout(function() {
			
			particlesJS.load('hero', 'assets/json/particlesjs-config.json', function() {
			  //console.log('callback - particles.js config loaded');
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
				accY : 50
			});
	
		}, 500);
		

	});

	ko.applyBindings(window, $('#app')[0]);
	
})();