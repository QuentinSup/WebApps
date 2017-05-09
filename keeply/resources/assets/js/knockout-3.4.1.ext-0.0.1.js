(function() {
	
	var field;
	
	window.field = field;
	
	document.registerElement('webkit-field', {
		    prototype: Object.create(
		      HTMLElement.prototype, {
		      createdCallback: {value: function() {
		    	  console.log(arguments);
		    	  	window.field = new kit.fields.TextUIField('toto');
		    	  	this.innerHTML = "<!-- ko template: { name: '" + window.field.template + "', data: window.field } --><!-- /ko -->";
		      }},
		      attachedCallback: {value: function() {
		    	  
		        console.log('live on DOM ;-) ');
		        
		      }},
		      detachedCallback: {value: function() {
		        console.log('leaving the DOM :-( )');
		      }},
		      attributeChangedCallback: {
		    	 value: function(name, previousValue, value) {
			        if (previousValue == null) {
			          console.log(
			            'got a new attribute ', name,
			            ' with value ', value
			          );
			        } else if (value == null) {
			          console.log(
			            'somebody removed ', name,
			            ' its value was ', previousValue
			          );
			        } else {
			          console.log(
			            name,
			            ' changed from ', previousValue,
			            ' to ', value
			          );
			        }
		    	 }}
		    })

		
	});
	
	
	
})();