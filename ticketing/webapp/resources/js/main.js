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