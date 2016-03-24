
//重写backbone 的 sync
var BackboneSync = Backbone.sync;
Backbone.sync = function(method, model, options) {

  // 在没有url 的情况下 取 api 的值 以防有特别的处理
  //测试
  if (App.API.Settings.debug) {
    model.url = App.API.DEBUGURL[model.urlType];
  } else {
    model.url = App.API.Settings.hostname + App.API.URL[model.urlType];
  }

  //url 是否有参数
  var urlPars = model.url.match(/\{([\s\S]+?(\}?)+)\}/g);
  if (urlPars) {
    for (var i = 0; i < urlPars.length; i++) {
      var rex = urlPars[i],
        par = rex.replace(/[{|}]/g, ""),
        val = model[par];
      if (val) {
        model.url = model.url.replace(rex, val);
      }
    }
  }

  //调用backbone 原本的方法
  return BackboneSync.apply(this, arguments);
};
App.Comm = {
  getUrlByType: function(data) {

    //是否调试
    if (App.API.Settings.debug) {
      data.url = App.API.DEBUGURL[data.URLtype];
    } else {
      data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
    }

    //没有调试接口
    if (!data.url) {
      data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
    }

    //url 是否有参数
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

    //删除
    if ((data.URLtype.indexOf("delete") > -1 || data.URLtype.indexOf("put") > -1) && data.data) {
      if (data.url.indexOf("?") == -1) {
        data.url += "?1=1";
      }
      for (var p in data.data) {
        data.url += "&" + p + "=" + data.data[p];
      }
    }

    return data;

  },
}
