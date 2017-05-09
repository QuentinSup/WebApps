<html>
<head>

	<link href="{$host}resources/assets/css/h5bp.min.css" rel="stylesheet" type="text/css" />
	<link href="{$host}resources/assets/css/bootstrap-3.2.0.min.css" rel="stylesheet" type="text/css" />
	
	<link href="{$host}resources/assets/css/main.css" rel="stylesheet" type="text/css" />
	<link href="{$host}resources/assets/css/blue/styles/styles.css" rel="stylesheet" type="text/css" />

	<script src="{$host}resources/assets/js/sprintf-1.0.0.min.js"></script>
	<script src="{$host}resources/assets/js/jquery-2.1.4.min.js"></script>
	<script src="{$host}resources/assets/js/knockout-3.3.0.min.js"></script>
	<script src="{$host}resources/assets/js/knockitjs-1.0.0.js"></script>

	{include file='resources/assets/ko-templates.tpl'}

</head>
<body>
	<div id="body">
		<div id="page-header"></div>
		<div id="page-menu">

		</div>
		<div id="page-body">
			<p>Hello world !</p>
			<form role="form" class="form-horizontal" novalidate>
				<div data-bind="template: { name: 'ui-field-template', data: email }"></div>
			</form>
		</div>
		<div id="page-footer"></div>
	</div>
	<script>
	
	(function() {
			
		
		app.servicesPath = '{$host}?';
		app.context.device = 'computer';
		app.context.app = 'computer';
		app.context.page = 'root';
		
		app.init();
		
		app.ready(function() {
			window.vm = {
				email: new kit.fields.EmailUIField('app')
			};
		
		
			new kit.FieldsValidatorDigest([
				vm.email
			]);
			
			
		
			ko.applyBindings(vm);
		});
	
	})();
	
	</script>
</body>
</html>
