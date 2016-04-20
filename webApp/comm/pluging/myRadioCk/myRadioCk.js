;
(function($) {

	// 单选，多选
	$.fn.myRadioCk = function(opts) {

		var settings = {
			click: null		 
		}

		this.settings = $.extend(settings, opts);

		var $that = $(this);
		//事件绑定
		this.bindEvent = function() {
			var that = this;
			$that.on("click", ".btnRadio,.btnCk", function() {
				//禁用不可选中
				if ($that.hasClass(".disable")) return;

				if ($(this).is(".btnCk")) {
					//选中样式
					$(this).toggleClass('selected');
				} else {
					//选中样式
					$(this).addClass('selected').siblings().removeClass('selected');
				}

				if ($.isFunction(that.settings.click)) {
					that.settings.click.call(that);
				}
			});
		}

		this.init = function() {
			this.bindEvent();
		}

		this.init();


	}

})(jQuery);