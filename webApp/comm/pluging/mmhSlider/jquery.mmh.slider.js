(function($) {

	var tpl = "<li class='{class}'><img src='{src}'></li>",
		toolTpl = "<label class='{class}'>&bull;</label>";

	$.fn.mmhSlider = function(name, options) {
		var _setting = null;
		if (typeof name === 'string') {
			return null;
		} else {
			options = name;
			_setting = $.extend({},
				$.fn.mmhSlider.defaults, options);
			$.fn.mmhSlider.methods['init']($(this), _setting);
		}

	}
	$.fn.mmhSlider.methods = {
		init: function($dom, setting) {
			var delay = setting.delay,
				_index = 0;
			$.fn.mmhSlider.methods.render($dom, setting, function(data) {
				setInterval(function() {
					var $current = $dom.find("li.selected"),
						$next = $current.next();
					if ($next.length === 0) {
						$next = $dom.find('li').first();
						_index = 0;
						$dom.find("label").last().toggleClass('flag');
					} else {
						$dom.find("label").eq(_index).toggleClass('flag');
						_index++;
					}
					$current.removeClass('selected').addClass('remove');
					$next.removeClass('remove').addClass('selected');
					$dom.find("label").eq(_index).toggleClass('flag');
					setting.onChange(data[_index]);
					$dom.find(".slideTitle").html(data[_index].title)
				}, delay)
			})

		},

		render: function($dom, setting, callback) {
			var data = setting.data || [],
				result = ["<ul>"],
				tools = ["<div class='toolbar'>"];
			for (var i = 0, size = data.length; i < size; i++) {
				var _ = tpl,
					__ = toolTpl;
				_ = _.replace('{class}', i == 0 ? 'selected' : 'remove');
				__ = __.replace('{class}', i == 0 ? 'flag' : 'mmh');
				_ = _.replace('{src}', data[i].image);
				result.push(_);
				tools.push(__);
			}
			tools.push("</div>");
			result.push("</ul>");
			result = result.concat(tools);
			result.push('<div class="slideTitle">' + data[0].title + '</div>');
			$dom.prepend(result.join(""));
			callback(data);
		}
	}
	$.fn.mmhSlider.defaults = {
		delay: 1000,
		onChange: function() {

		}
	}
}(jQuery))