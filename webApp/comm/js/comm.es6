App.Comm = {};



_.templateUrl = function(url, notCompile) {
	var result;
	$.ajax({
		url: url,
		type: 'GET',
		async: false
	}).done(function(tpl) {
		if (notCompile) {
			result = tpl;
		} else {
			result = _.template(tpl);
		}

	});
	return result;
}


_.getTmplByUrl = function(url) {
	var result;
	$.ajax({
		url: url,
		type: 'GET',
		async: false
	}).done(function(tpl) {
		result = tpl;
	});
	return result;
}

App.Comm.requireCache = [];

//按需加载 
_.require = function(url) {

	//加载过不再加载
	if (App.Comm.requireCache.indexOf(url) == -1) {
		App.Comm.requireCache.push(url);
	} else {
		return;
	}

	var type = url.substring(url.lastIndexOf(".") + 1);
	if (type == "js") {
		$("head").append('<script type="text/javascript" src="' + url + '" id="todoJs"></script>');
	} else if (type = "css") {
		$("head").append('<link rel="styleSheet" href="' + url + '" />');
	}
}


function StringBuilder() {
	this._buffers = [];
	this._length = 0;
	this._splitChar = arguments.length > 0 ? arguments[arguments.length - 1] : '';

	if (arguments.length > 0) {
		for (var i = 0, iLen = arguments.length - 1; i < iLen; i++) {
			this.Append(arguments[i]);
		}
	}
}

//向对象中添加字符串
//参数：一个字符串值
StringBuilder.prototype.Append = function(str) {
	this._length += str.length;
	this._buffers[this._buffers.length] = str;
}
StringBuilder.prototype.Add = StringBuilder.prototype.append;



StringBuilder.prototype.IsEmpty = function() {
		return this._buffers.length <= 0;
	}
	//清空
StringBuilder.prototype.Clear = function() {
	this._buffers = [];
	this._length = 0;
}

StringBuilder.prototype.toString = function() {
	if (arguments.length == 1) {
		return this._buffers.join(arguments[1]);
	} else {
		return this._buffers.join(this._splitChar);
	}
}

StringBuilder.prototype.AppendFormat = function() {
	if (arguments.length > 1) {
		var TString = arguments[0];
		if (arguments[1] instanceof Array) {
			for (var i = 0, iLen = arguments[1].length; i < iLen; i++) {
				var jIndex = i;
				var re = eval("/\\{" + jIndex + "\\}/g;");
				TString = TString.replace(re, arguments[1][i]);
			}
		} else {
			for (var i = 1, iLen = arguments.length; i < iLen; i++) {
				var jIndex = i - 1;
				var re = eval("/\\{" + jIndex + "\\}/g;");
				TString = TString.replace(re, arguments[i]);
			}
		}
		this.Append(TString);
	} else if (arguments.length == 1) {
		this.Append(arguments[0]);
	}
}

/** trim() method for String */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};