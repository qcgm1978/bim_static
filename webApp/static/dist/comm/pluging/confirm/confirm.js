"use strict";

;
(function ($) {

	$.confirm = function (text, enterCallback, canelCallback) {

		if ($(".confirm").length > 0) {
			return;
		}

		var tpl = _.templateUrl('/comm/pluging/confirm/confirm.html', true),
		    opts = {
			width: 284,
			showTitle: false,
			cssClass: "confirm",
			showClose: false,
			isAlert: false,
			limitHeight: false,
			isConfirm: false
		};

		opts.message = tpl.replace('{text}', text);;

		var confirmDialog = new App.Comm.modules.Dialog(opts);

		confirmDialog.element.find(".btnEnter").click(function () {

			if ($.isFunction(enterCallback)) {
				if (enterCallback() != false) {
					confirmDialog.close();
				}
			} else {
				confirmDialog.close();
			}
		});

		confirmDialog.element.find(".btnCanel").click(function () {

			if ($.isFunction(canelCallback)) {
				canelCallback();
			}
			confirmDialog.close();
			return false;
		});
	};
})(jQuery);