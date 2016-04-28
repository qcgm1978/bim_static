(function($) {

	var tpl = "<li class='{class}' style='background-image:url({src})'></li>",
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
				_index = 0,
				_pause=$.fn.mmhSlider.defaults._pause;
			$.fn.mmhSlider.methods.render($dom, setting, function(data) {
				//定时器任务
				setInterval(function() {
					if(_pause){
						return 
					}
					$.fn.mmhSlider.methods.next($dom,setting,data)
				}, delay)
				
				$dom.find("li").hover(function() {
					_pause = true;
				}, function() {
					_pause = false
				})
			})

		},
		
		next:function($dom,setting,data){
			var $current = $dom.find("li.selected"),
				$next = $current.next(),
				_index=$.fn.mmhSlider.defaults._index;
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
		},
		
		random:function($dom,setting,data){
			var $current = $dom.find("li.selected");
				_index=$.fn.mmhSlider.defaults._index;
			$current.removeClass('selected').addClass('remove');
			$dom.find("label").eq($current.index()).toggleClass('flag');
			$dom.find("label").eq(_index).toggleClass('flag');
			$dom.find("li").eq(_index).removeClass('remove').addClass('selected');
			setting.onChange(data[_index]);
			$dom.find(".slideTitle").html(data[_index].title)
		},

		render: function($dom, setting, callback) {
			var data = setting.data || [],
				result = ["<ul>"],
				tools = ["<div class='toolbar'>"];
			for (var i = 0, size = data.length; i < size; i++) {
				var _ = tpl,
					__ = toolTpl;
				_ = _.replace('{class}', i == 0 ? 'selected' : 'remove');
				__ = __.replace('{class}', i == 0 ? 'nonFlag flag' : 'nonFlag');
				_ = _.replace('{src}', data[i].image);
				result.push(_);
				tools.push(__);
			}
			tools.push("</div>");
			result.push("</ul>");
			result = result.concat(tools);
			result.push('<div class="slideTitle">' + data[0].title + '</div>');
			$dom.prepend(result.join(""));
			
			setting.onChange(data[0]);
			
			callback(data);
			$dom.find("label").on("click",function(){
				$.fn.mmhSlider.defaults._index=$(this).index();
				$.fn.mmhSlider.defaults._pause=true;
				setTimeout(function(){
					$.fn.mmhSlider.defaults._pause=false;
				},setting.delay)
				$.fn.mmhSlider.methods.random($dom,setting,data);
			})
		},
		
		change:function($dom,index){}
	}
	$.fn.mmhSlider.defaults = {
		delay: 1000,
		_index:0,
		_pause:false,
		onChange: function() {

		}
	}
}(jQuery))