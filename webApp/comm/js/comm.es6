App.Comm = {

	Settings: {
		v: 20160312,
		pageItemCount: Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	//��װajax
	ajax: function(data, callback) {

		data = App.Comm.getUrlByType(data);

		if ($.isFunction(callback)) {
			$.ajax(data).done(function(data) {
				if (_.isString(data)) {
					// to json
					if (JSON && JSON.parse) {
						data = JSON.parse(data);
					} else {
						data = $.parseJSON(data);
					}
				}

				//�ص�
				callback(data);

			});
		} else {
			return $.ajax(data);
		}

	},

	getUrlByType: function(data) {

		//�Ƿ����
		if (App.API.Settings.debug) {
			data.url = App.API.DEBUGURL[data.URLtype];
		} else {
			data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
		}

		//û�е��Խӿ�
		if (!data.url) {
			data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
		}

		//url �Ƿ��в���
		var urlPars = data.url.match(/\{([\s\S]+?(\}?)+)\}/g);
		var temp = data.data;
		if ((typeof temp) == 'string') {
			temp = JSON.parse(temp);
		}
		if (urlPars) {
			for (var i = 0; i < urlPars.length; i++) {

				var rex = urlPars[i],
					par = rex.replace(/[{|}]/g, ""),
					val = temp[par];
				if (val) {
					data.url = data.url.replace(rex, val);
				}
			}
		}

		//ɾ��
		if ((data.URLtype.indexOf("delete") > -1 || data.URLtype.indexOf("put") > -1) && data.data) {
			if (data.url.indexOf("?") == -1) {
				data.url += "?1=1";
			}
			for (var p in data.data) {
				data.url += "&" + p + "=" + data.data[p];
				data.url += "?1=1";
			}
			for (var p in data.data) {
				data.url += "&" + p + "=" + data.data[p];
			}
		}

		return data;

	},

	//JS����cookies����!
	//дcookies
	setCookie: function(name, value) {
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	},
	//��ȡcookie
	getCookie: function(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		if (arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},
	//ɾ��cookie
	delCookie: function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	},
	//��ʽ�� �ļ���С
	formatSize: function(size) {
		if (size === undefined || /\D/.test(size)) {
			return '';
		}
		if (size >= 1073741824) {
			return (size / 1073741824).toFixed(2) + 'GB';
		}
		if (size >= 1048576) {
			return (size / 1048576).toFixed(2) + 'MB';
		} else if (size >= 6) {
			return (size / 1024).toFixed(2) + 'KB';
		} else {
			return size + 'b';
		}
	},
	//״̬ת��
	convertStatus: function(status) {
		//1�����ϴ���2���ϴ��У�3�����ϴ���4������ˣ�5�����ͨ����6������˻أ�7�����ƽ���8���ƽ��˻أ�9���ѷ���

		var result = "";
		if (status == 1) {
			result = "���ϴ�";
		} else if (status == 2) {
			result = "�ϴ���";
		} else if (status == 3) {
			result = "���ϴ�";
		} else if (status == 4) {
			result = "�����";
		} else if (status == 5) {
			result = "���ͨ��";
		} else if (status == 6) {
			result = "����˻�";
		} else if (status == 7) {
			result = "���ƽ�";
		} else if (status == 8) {
			result = "�ƽ��˻�";
		} else if (status == 9) {
			result = "�ѷ���";
		}

		return result;
	},

	//������ݿ�
	navBarToggle: function($el, $content, dirc, Viewer) {

		var dircWidth, mDirc;
		if (dirc == "left") {
			mDirc = "margin-left";
		} else {
			mDirc = "margin-right";
		}

		dircWidth = parseInt($el.css(mDirc));

		if (dircWidth < 0) {

			var ani = {}
			ani[mDirc] = "0px";

			$el.animate(ani, 500, function() {
				$el.find(".dragSize").show().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				$content.css(mDirc, $el.width());
				if (Viewer) {
					Viewer.resize();
				}

			});
		} else {
			var width = $el.width(),
				ani = {};

			ani[mDirc] = -width;
			$el.animate(ani, 500, function() {
				$el.find(".dragSize").hide().end().find(".slideBar i").toggleClass('icon-caret-left icon-caret-right');
				$content.css(mDirc, 0);
				if (Viewer) {
					Viewer.resize();
				}
			});
		}

	},
	//��ק�ı�ߴ�
	dragSize: function(event, $el, $content, dirc, Viewer) {

		var initX = event.pageX,
			isLeft = dirc == "left" ? true : false,
			initWidth = $el.width();

		var $target = $(event.target);

		$(document).on("mousemove.dragSize", function(event) {
			var newWidth;
			if (isLeft) {
				newWidth = initWidth + event.pageX - initX;
			} else {
				newWidth = initWidth + initX - event.pageX;
			}

			$el.width(newWidth);
		});

		$(document).on("mouseup.dragSize", function() {

			$(document).off("mouseup.dragSize");
			$(document).off("mousemove.dragSize");

			var contentWidth = $content.width(),
				leftNavWidth = $el.width(),
				gap = leftNavWidth - initWidth;

			var mPos = "margin-right";
			if (isLeft) {
				mPos = "margin-left";
			}

			if (contentWidth - gap < 10) {
				var maxWidth = initWidth + contentWidth - 10;
				$el.width(maxWidth);
				$content.css(mPos, maxWidth);
			} else {
				$content.css(mPos, leftNavWidth);
			}
			if (Viewer) {
				Viewer.resize();
			}
		});

		return false;

	}

};



//ģ��
App.Comm.modules = {};