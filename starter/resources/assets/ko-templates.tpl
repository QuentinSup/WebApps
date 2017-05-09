{literal}
<script id="ui-field-template" type="text/html">
	<!-- ko if: isVisible -->
		<div class="form-group" data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns(), 'ui-field-disabled': isDisabled() }">
			<div data-bind="css: { 'col-xs-6': !isEditable() && showLabel(), 'col-sm-6': showLabel(), 'hidden': !showLabel() }, template: { name: $data.labelTemplate }"></div>
			<div data-bind="css: { 'col-xs-6': !isEditable() && showLabel(), 'col-sm-6': showLabel(), 'col-sm-12': !showLabel() }">
				<!-- ko template: { name: $data.inputTemplate } --><!-- /ko -->
				<!-- ko if: showMessages() && messages().length > 0 -->
				<ul class="ui-field-messages" data-bind="foreach: messages">
					<li data-bind="html: $data.text, css: { 'warn': $data.isWarn }"></li>
				</ul>
				<!-- /ko -->
			</div>
		</div>
	<!-- /ko -->
</script>

<script id="ui-field-label-template" type="text/html">
	<div class="form-label" data-bind="css: { 'with-tooltip': (tooltip.text() != '' && tooltip.show()) }" >
		<div class="label">
			<label for="" data-bind="attr: {'for': uid }, html: formattedLabel"></label>
			<span class="requiredInput" data-bind="visible: isEditable(), html: isRequired() && !isDisabled()?'*':'&nbsp;'"></span>
			<!-- ko template: { name: 'ui-tooltip', data: tooltip } --><!-- /ko -->
		</div>
	</div>
</script>

<script id="ui-field-text-template" type="text/html">
	<!-- ko if: isEditable() -->
	<input id="" data-bind="valueUpdate: valueUpdateOn(), disable: isReadOnly() || isDisabled(), attr: { 'id': uid, 'name': name()?name:null, 'pattern':pattern()?pattern:null, 'placeholder': !isFocused()?placeholder:null, 'maxlength': maxLength }, event: { 'blur': function() { onBlurEventHandler(); }, 'focus': function() { onFocusEventHandler(); } }, value: formattedValue, css: { /* QuickFix IE<=9 */ 'placeholdersjs': !value() && !isFocused(), 'ui-input-empty': !value() && !isFocused(), 'ui-input-invalid': !isDisabled() && !isLastInputValid(), 'ui-input-valid': !isDisabled() && isLastInputValid(), 'ui-input-readonly': isReadOnly() || isDisabled(), 'ui-input-visited': hasBeenVisited() }" type="text" placeholder="" />
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
	<div class="ui-field-readonly" data-bind="text: formattedValue() || '&nbsp;'"></div>
	<!-- /ko -->
</script>

<script id="ui-field-textarea-template" type="text/html">
	<!-- ko if: isEditable() -->
		<textarea data-bind="disable: isReadOnly() || isDisabled(), attr: { 'id': uid, 'name': name()?name:null, 'placeholder': !isFocused()?placeholder:null, 'rows': rows }, value: value, event: { 'blur': function() { onBlurEventHandler(); }, 'focus': function() { onFocusEventHandler(); } }, css: { 'ui-input-empty': !value() && !isFocused(), 'ui-input-invalid': !isDisabled() && !isLastInputValid(), 'ui-input-valid': !isDisabled() && isLastInputValid(), 'ui-input-readonly': isReadOnly() || isDisabled(), 'ui-input-visited': hasBeenVisited() }"></textarea>
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
		<p class="ui-field-readonly" data-bind="text: value() || '&nbsp;'"></p>
	<!-- /ko -->
</script>

<script id="ui-field-date-template" type="text/html">
	<!-- ko if: isEditable() -->
	<div class="input-group ui-field-date">
		<div data-bind="template: { 'name': 'ui-field-text-template' }"></div>
		<!-- ko if: isReadOnly() || isDisabled() -->
			<div class="input-group-addon glyphicon glyphicon-calendar"></div>
		<!-- /ko -->
		<!-- ko if: !(isReadOnly() || isDisabled()) -->
			<div class="input-group-addon glyphicon glyphicon-calendar" data-bind="datepicker: { id: uid, options: { minDate: minDate(), maxDate: maxDate() } }"></div>
		<!-- /ko -->
	</div>
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
	<div class="ui-field-date ui-field-readonly">
		<span data-bind="text: formattedValue() || '&nbsp;'"></span>
	</div>
	<!-- /ko -->
</script>

<script id="ui-tooltip" type="text/html">
	<!-- ko if: text() -->
	<div class="ui-ico-hint" data-bind="attr: { id: uid }, visible:  show(), tooltip: { text: text, animation: animation, position: position }"></div>
	<!-- /ko -->
</script>

<script id="ui-field-numeric-template" type="text/html">
	<!-- ko if: isEditable() -->
	<div class="ui-group-numeric" data-bind="css: { 'input-group': unit }">
		<div class="ui-field-numeric" data-bind="template: { 'name': 'ui-field-text-template' }"></div>
		<div class="input-group-addon" data-bind="visible: unit, html: unit"></div>
	</div>	
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
	<div class="ui-group-numeric ui-field-numeric ui-field-readonly"><span data-bind="text: formattedValue() || '&nbsp;'"></span> <span data-bind="visible: unit() && value(), html: unit"></span></div>
	<!-- /ko -->
</script>

<script id="ui-field-codepostal-template" type="text/html">
	<div class="ui-group-codepostal">
		<div data-bind="template: { 'name': 'ui-field-text-template', data: oTextUIField }" class="ui-field-numeric pull-left ui-field-codepostal-input"></div>
		<div data-bind="template: { 'name': 'ui-field-select-template', data: oSelectUIField }" class="pull-left ui-field-codepostal-select"></div>
		<div class="clearfix"></div>
	</div>
</script>

<script id="ui-field-select-template" type="text/html">
	<!-- ko if: isEditable() -->
	<div data-bind="template: { name: 'ui-field-select-' + view() + '-template' }"></div>
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
	<div class="ui-field-readonly" data-bind="text: selectedOptionText() || '&nbsp;'"></div>
	<!-- /ko -->
</script>

<script id="ui-field-select-default-template" type="text/html">
	<div class="ui-field-select">
		<select id="" data-bind="disable: isReadOnly() || isDisabled() || options().length == 0, attr: { 'id': uid, 'name': name()?name:null }, value: value, optionsCaption: (options().length > 1?placeholder() || null:null), optionsText: 'text', optionsValue: 'value', optionsAfterRender: fr.ca.cat.fields.Option.afterRenderFunction, options: options, css: { 'ui-input-invalid': !isDisabled() && !isLastInputValid(), 'ui-input-valid': !isDisabled() && isLastInputValid(), 'ui-input-readonly': isReadOnly() || isDisabled(), 'ui-input-visited': hasBeenVisited(), 'ui-input-empty': !value() }, event: { 'blur': function() { onBlurEventHandler(); }, 'focus': function() { onFocusEventHandler(); } }"></select>
	</div>
</script>

<script id="ui-field-selectcond-template" type="text/html">
	<!-- ko if: isEditable() -->
	<input type="radio" name="" value="" style="position: absolute; top: 2px" data-bind="disable: isDisabled(), value: condValue, checked: condUIField.value, attr: { 'name': condUIField.uid }" />
	<div data-bind="template: 'ui-field-select-template'" style="margin-left:20px"></div>
	<!-- /ko -->
	<!-- ko if: !isEditable() -->
	<div class="ui-field-readonly" data-bind="visible: !isDisabled(), text: selectedOptionText()"></div>
	<!-- /ko -->
</script>

<script id="ui-field-select-radios-template" type="text/html">
	<div data-bind="foreach: options, css: { 'form-inline': inline }">
		<div class="radio"> 
		    <input data-bind="disable: $parent.isReadOnly() || $parent.isDisabled() || disabled(), attr: { 'checked': $parent.value() == value, 'name': $parent.uid, 'id': $parent.uid + '-' + $index() }, value: value, click: function(option, e) { $parent.viewRadiosOptionClickFunction(option, e); return true; }, event: { 'blur': function() { $parent.onBlurEventHandler(); }, 'focus': function() { $parent.onFocusEventHandler(); } }" type="radio" />
		    <label data-bind="text: text, attr: { 'for': $parent.uid + '-' + $index() }"></label>
			<!-- ko template: { name: 'ui-tooltip', data: tooltip } --><!-- /ko -->
		</div>
	</div>
</script>

<script id="ui-field-select-buttons-template" type="text/html">
	<div data-bind="foreach: options, css: { 'btn-group': inline, 'btn-group-vertical': !inline() }" role="group">
		<button type="button" class="btn btn-default" data-bind="disable: $parent.isReadOnly() || $parent.isDisabled() || disabled(), attr: { 'checked': $parent.value() == value, 'name': $parent.uid, 'id': $parent.uid + '-' + $index() }, value: value, click: function(option, e) { $parent.viewRadiosOptionClickFunction(option, e); return true; }, event: { 'blur': function() { $parent.onBlurEventHandler(); }, 'focus': function() { $parent.onFocusEventHandler(); } }"> 
			<span data-bind="text: text"></span>
			<!-- ko template: { name: 'ui-tooltip', data: tooltip } --><!-- /ko -->
		</button>
	</div>
</script>

<script id="ui-field-row-template" type="text/html">
	<!-- ko if: isVisible -->
	<tr data-bind="css: { 'ui-group-invalid': !isDisabled() && !isLastInputValid(), 'ui-group-valid': !isDisabled() && isLastInputValid(), 'ui-group-visited': hasBeenVisited(), 'ui-group-warned': hasWarns() }">
		<!-- ko if: showLabel -->
		<td class="labelTD" data-bind="template: { name: 'ui-field-label-template' }"></td>
		<!-- /ko -->
		<!-- ko foreach: oListOfUIField() -->
		<td data-bind="visible: $data.isVisible" style="position: relative">
			<div data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns() }">
				<!-- ko template: { name: $data.inputTemplate } --><!-- /ko -->
			</div>
		</td>
		<!-- /ko -->
	</tr>
	<!-- ko if: showMessages() &&  messages().length > 0 -->
	<tr class="ui-group-messages" data-bind="css: { 'ui-group-invalid': !isDisabled() && !isLastInputValid(), 'ui-group-valid': !isDisabled() && isLastInputValid(), 'ui-group-visited': hasBeenVisited(), 'ui-group-warned': hasWarns() }">
		<!-- ko if: showLabel -->
		<td class="labelTD">&nbsp;</td>
		<!-- /ko -->
		<!-- ko foreach: oListOfUIField() -->
		<!-- ko if: $data.isVisible -->
		<td style="position: relative">
			<div data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns() }">
				<!-- ko if: showMessages() &&  messages().length > 0 -->
				<ul class="ui-field-messages" data-bind="foreach: messages">
					<li data-bind="html: $data.text, css: { 'warn': $data.isWarn }"></li>
				</ul>
				<!-- /ko -->
			</div>
		</td>
		<!-- /ko -->
		<!-- /ko -->
	</tr>
	<!-- /ko -->
	<!-- /ko -->
</script>

<script id="ui-field-group-template" type="text/html">
	<!-- ko if: isVisible -->
		<div data-bind="css: { 'ui-group-invalid': !isDisabled() && !isLastInputValid(), 'ui-group-valid': !isDisabled() && isLastInputValid(), 'ui-group-visited': hasBeenVisited(), 'ui-group-warned': hasWarns()  }">
			<div class="data-bind="css: { 'col-sm-3': showLabel(), 'hidden': !showLabel() }, template: { name: 'ui-field-label-template' }"></div>
			<!-- ko foreach: oListOfUIField() -->
				<div data-bind="visible: $data.isVisible, css: { 'col-sm-3': $parent.showLabel(), 'col-sm-4': !$parent.showLabel() }">
					<div data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns() }">
						<!-- ko template: { name: $data.inputTemplate } --><!-- /ko -->
						<!-- ko if: showMessages() &&  messages().length > 0 -->
						<ul class="ui-field-messages" data-bind="foreach: messages">
							<li data-bind="html: $data.text, css: { 'warn': $data.isWarn }"></li>
						</ul>
						<!-- /ko -->
					</div>
				</div>
			<!-- /ko -->
		</div>
	<!-- /ko -->
</script>

<script id="ui-field-group-template-responsive" type="text/html">
	<!-- ko if: $data.isVisible() -->
	<fieldset class="form-fieldset hidden-lg">
		<legend>
			<span data-bind="html: $data.label"></span>
			<!-- ko template: { name:'ui-tooltip', data: $data.tooltip } --><!-- /ko -->
		</legend>
		<!-- ko template: { name: 'ui-field-template', foreach: $data.oListOfUIField() } --><!-- /ko -->
	</fieldset>
	<!-- /ko -->	
</script>

<script id="ui-field-template-row" type="text/html">
	<!-- ko if: $data.isVisible() -->
	<div class="field-row" data-bind="css: { 'ui-group-invalid': !isDisabled() && !isLastInputValid(), 'ui-group-valid': !isDisabled() && isLastInputValid(), 'ui-group-visited': hasBeenVisited(), 'ui-group-warned': hasWarns() }">
		<div class="form-group" data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid() }">
			<div class="col-sm-12" data-bind="css: { 'hidden': !showLabel() }, template: { name: $data.labelTemplate }"></div>
			<div class="col-sm-12">
				<div data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns() }">
				<!-- ko template: { name: $data.inputTemplate } --><!-- /ko -->
				<!-- ko if: showMessages() &&  messages().length > 0 -->
				<ul class="ui-field-messages" data-bind="foreach: messages">
					<li data-bind="html: $data.text, css: { 'warn': $data.isWarn }"></li>
				</ul>
				<!-- /ko -->
				</div>
			</div>
		</div>
	</div>
	<!-- /ko -->
</script>

<script id="ui-field-group-first-template" type="text/html">
	<!-- ko if: $data.isVisible() -->
		<div class="form-group" data-bind="css: { 'ui-group-invalid': !isDisabled() && !isLastInputValid(), 'ui-group-valid': !isDisabled() && isLastInputValid(), 'ui-group-visited': hasBeenVisited(), 'ui-group-warned': hasWarns() }">
			<div data-bind="css: { 'col-xs-6': !isEditable() && showLabel(), 'col-sm-6': showLabel(), 'hidden': !showLabel() }, template: { name: 'ui-field-label-template' }"></div>
			<!-- ko with: oListOfUIField()[0] -->
			<div data-bind="css: { 'col-xs-6': !$parent.isEditable() && $parent.showLabel(), 'col-sm-6': $parent.showLabel(), 'col-sm-12': !$parent.showLabel() }">
				<div data-bind="css: { 'ui-field-invalid': !isDisabled() && !isLastInputValid(), 'ui-field-valid': !isDisabled() && isLastInputValid(), 'ui-field-visited': hasBeenVisited(), 'ui-field-warned': hasWarns() }">
				<!-- ko template: { name: $data.inputTemplate } --><!-- /ko -->
				<!-- ko if: showMessages() &&  messages().length > 0 -->
				<ul class="ui-field-messages" data-bind="foreach: messages">
					<li data-bind="html: $data.text, css: { 'warn': $data.isWarn }"></li>
				</ul>
				<!-- /ko -->
				</div>
			</div>
			<!-- /ko -->
		</div>
	<!-- /ko -->
</script>
{/literal}