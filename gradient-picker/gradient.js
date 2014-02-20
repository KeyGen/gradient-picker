(function($) {

	var pluginName = "gradient",
	
	defaults = {
		target: null,
		sliders:  null,
		type: 'linear',
		typeRad: null,
		name: null,
		position: 'left top',
		debug: false,
		paramsJson: [],
		paramsCss: [],
		save: 'css' // json, css
	},
	_private = {
		_targets: [],
		_code: [],
		_pos_first: [],
		_pos_last: [],
		_type: [],
		_types: [{key: 'linear', name: 'Linear'}, {key: 'radial', name: 'Radial'}],
		_typeRad: [],
		_typesRad: [{key: 'circle', name: 'Circle'}, {key: 'ellipse', name: 'Ellipse'}],
		_pos_firsts: [{key: '', name: 'Null'}, {key: 'top', name: 'Top'}, {key: 'bottom', name: 'Bottom'}],
		_pos_lasts: [{key: '', name: 'Null'}, {key: 'left', name: 'Left'}, {key: 'right', name: 'Right'}],
		_result: null
	};

	function Plugin(element, options)
	{
		var defaultsParams = {
			target: null,
			save : 'css',
			type : 'radial',
			typeRad: null,
			name: null,
			debug: false,
			paramsCss: [],
			position : 'top right',
			sliders : {
				one : {
					color : '#AF03BF',
					position : 12
				},
				two : {
					color : '#0000ff',
					position : 100
				}
			}
		}
		
		this.element = $(element);
		
		if (options !== undefined) {
			
			if (options.paramsCss !== undefined) {
				var css = [];
				options.paramsCss = options.paramsCss.replace('background: ', '');
				css.type = options.paramsCss.substr(0, options.paramsCss.indexOf('-'));
				options.paramsCss = options.paramsCss.replace(css.type + '-gradient(', '');
				options.paramsCss = options.paramsCss.replace(');', '');

				if (options.paramsCss.indexOf(' at') !== -1){
					css.typeRad = options.paramsCss.substr(0, options.paramsCss.indexOf(' at'));
					options.paramsCss = options.paramsCss.replace(css.typeRad + ' at ', '');
				} else {
					options.paramsCss = options.paramsCss.replace('to ', '');
				}

				css.position = options.paramsCss.substr(0, options.paramsCss.indexOf(','));
				options.paramsCss = options.paramsCss.replace(css.position + ', ', '');

				css.sliders = {};
				var sliders = options.paramsCss.split(' , ');
				for (var i = 0; i<sliders.length; i++) {
					var slider = sliders[i].split(' ');
					var result = [];
					result.color = slider[0];
					result.position = slider[1].replace('%', '');
					if (!i) {
						css.sliders.one = result;
					} else {
						css.sliders.two = result;
					}
				}
				options = $.extend(options, css);
			}

			if (options.paramsJson !== undefined) {
				options = $.extend(options, options.paramsJson);
			}
		} else {
			defaults = defaultsParams;
		}
		
		this.options = $.extend(defaults, options);
		this.options = $.extend(_private, this.options);
		
		defaults = defaultsParams;
		
		this.init();
	}

	Plugin.prototype =
		{
			init: function() {
				
				var plugin = this;
				var element = this.element;
				var id = element.attr('id');
				
				plugin.options._targets[id] = $(plugin.options.target);
				
				// type set
				element.append('<select class="select-gradient" id="select-type-' + id + '"></select>');
				plugin.options._type[id] = $('#select-type-' + id);
				var selected = '';
				for (var i = 0; i<plugin.options._types.length; i++) {
					if (plugin.options._types[i]['key'] === plugin.options.type) {
						selected = 'selected="selected"';
					} else {
						selected = '';
					}
					plugin.options._type[id].append('<option ' + selected + ' value="' + plugin.options._types[i]['key'] + '">' + plugin.options._types[i]['name'] + '</option>');
				}
				// type set

				element.append('<select class="select-pos select-gradient" id="select-pos-first-' + id + '"></select>');
				plugin.options._pos_first[id] = $('#select-pos-first-' + id);
				element.append('<select class="select-pos select-gradient" id="select-pos-last-' + id + '"></select>');
				plugin.options._pos_last[id] = $('#select-pos-last-' + id);

				plugin.options.position = plugin.options.position.split(" ");
				
				selected = '';
				for (i = 0; i<2; i++) {
					
					if (plugin.options.position[i]) {
						plugin.options.position[i] = plugin.options.position[i].replace(' ', '');
					} else {
						plugin.options.position[i] = '';
					}
					
					if (!i) {
						for (var j = 0; j<plugin.options._pos_firsts.length; j++) {
							plugin.options._pos_first[id].append('<option ' + (plugin.options.position[i] === plugin.options._pos_firsts[j]['key'] ? 'selected="selected"' : '') + ' value="' + plugin.options._pos_firsts[j]['key'] + '">' + plugin.options._pos_firsts[j]['name'] + '</option>');
						}
					} else {
						for (var j = 0; j<plugin.options._pos_lasts.length; j++) {
							plugin.options._pos_last[id].append('<option ' + (plugin.options.position[i] === plugin.options._pos_lasts[j]['key'] ? 'selected="selected"' : '') + ' value="' + plugin.options._pos_lasts[j]['key'] + '">' + plugin.options._pos_lasts[j]['name'] + '</option>');
						}
					}
				}
				
				// type set rad
				element.append('<select class="select-gradient" id="select-typeRad-' + id + '"></select>');
				plugin.options._typeRad[id] = $('#select-typeRad-' + id);
				selected = '';
				for (var i = 0; i<plugin.options._typesRad.length; i++) {
					if (plugin.options._typesRad[i]['key'] === plugin.options.typeRad) {
						selected = 'selected="selected"';
					} else {
						selected = '';
					}
					plugin.options._typeRad[id].append('<option ' + selected + ' value="' + plugin.options._typesRad[i]['key'] + '">' + plugin.options._typesRad[i]['name'] + '</option>');
				}
				// type set rad
				
				var hidden = 'type="hidden"';
				if (plugin.options.debug) {
					hidden = '';
				}
				
				element.append('<div id="slider-' + id + '"></div>');
				element.append('<div id="slider-' + id + '"></div>');
				element.append('<input ' + hidden + ' id="code-' + id + '">');
				
				element.append('<input ' + hidden + ' id="color-one-' + id + '">');
				element.append('<input ' + hidden + ' id="color-two-' + id + '">');
				
				var colorOne = $('#color-one-' + id).val(this.options.sliders.one.color);
				var colorTwo = $('#color-two-' + id).val(this.options.sliders.two.color);
				
				var slider = $("#slider-" + id);
				
				$(slider).slider({
					min: 0,
					max: 100,
					step: 5,
					range: true,
					values: [ this.options.sliders.one.position, this.options.sliders.two.position ],
					slide: function( event, ui ) {
						plugin.update(id, plugin, ui.values, colorOne.val(), colorTwo.val());
					}
				});
				
				var itemOne = $('#slider-' + id + ' .ui-slider-handle:last');
				var itemTwo = $('#slider-' + id + ' .ui-slider-handle:first');
				plugin.options._code[id] = $('#code-' + id);
				if (plugin.options.name === null) {
					plugin.options._code[id].attr('name', 'code[' + id + ']');
				} else {
					plugin.options._code[id].attr('name', plugin.options.name);
				}
				
				itemOne.css('background-color', this.options.sliders.one.color);
				itemTwo.css('background-color', this.options.sliders.two.color);
				
				$(itemOne).colpick({
					color: this.options.sliders.one.color,
					layout: 'hex',
					submit: 0,
					onChange: function (hsb, hex, rgb) {
						itemOne.css('backgroundColor', '#' + hex);
						colorOne.val('#' + hex);
						plugin.update(id, plugin, $(slider).slider("option", "values"), colorOne.val(), colorTwo.val());
					}
				});
				$(itemTwo).colpick({
					color: this.options.sliders.two.color,
					layout: 'hex',
					submit: 0,
					onChange: function (hsb, hex, rgb) {
						itemTwo.css('backgroundColor', '#' + hex);
						colorTwo.val('#' + hex);
						plugin.update(id, plugin, $(slider).slider("option", "values"), colorOne.val(), colorTwo.val());
					}
				});
				$(window).resize(function(){
					$('.colorpicker').hide();
				});
				
				$('.select-pos').on('change', function(){
					plugin.update(id, plugin, $(slider).slider("option", "values"), colorOne.val(), colorTwo.val());
				});
				
				$(plugin.options._type[id]).on('change', function(){
					if ($(this).val() === 'linear') {
						$(plugin.options._typeRad[id]).hide();
					} else {
						$(plugin.options._typeRad[id]).show();
					}
					plugin.update(id, plugin, $(slider).slider("option", "values"), colorOne.val(), colorTwo.val());
				});
				
				if (plugin.options._type[id].val() === 'linear') {
					$(plugin.options._typeRad[id]).hide();
				}
				
				plugin.update(id, plugin, $(slider).slider("option", "values"), colorOne.val(), colorTwo.val());
			},
			update: function(id, plugin, slider, colorOne, colorTwo) {
				var value = slider;
				
				var firstPos = value[0];
				var lastPos = value[1];
				
				var background = 'background: ' + plugin.options._type[id].val() + '-gradient(' + (plugin.options._type[id].val() === 'linear' ? 'to ' : plugin.options._typeRad[id].val() + ' at ') + plugin.options._pos_first[id].val() + ' ' + plugin.options._pos_last[id].val() + ', ' + colorOne + ' ' + firstPos + '% , ' + colorTwo + ' ' + lastPos + '%);';
				plugin.options._targets[id].attr('style', background);
				
				if (plugin.options.save === 'json') {
					plugin.options._result = {
						type : plugin.options._type[id].val(),
						typeRad : (plugin.options._type[id].val() === 'linear' ? '' : plugin.options._typeRad[id].val()),
						position : plugin.options._pos_first[id].val() + ' ' + plugin.options._pos_last[id].val(),
						sliders : {
							one : {
								color: colorOne,
								position: firstPos
							},
							two : {
								color: colorTwo,
								position: lastPos
							}
						}
					};

					plugin.options._code[id].val(JSON.stringify(plugin.options._result));
				} else {
					plugin.options._code[id].val(background);
				}
			}
		}

	$.fn[pluginName] = function(options)
	{
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery);