/**
 * @require /services/collections/index.es6
 */

App.Services.KeyUser = {

  //暂存已被选关键用户的uid数组
  uid : [],



  loadData : function(collection,data,fn) {

    data = data || {};
    //collection.reset();
    collection.fetch({
      remove: false,
      data:data,
      success: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      },
      error: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      }
    });
  },

  ajax : function(data,cb){
    //是否调试
    if (App.API.Settings.debug) {
      data.url = App.API.DEBUGURL[data.URLtype];
    } else {
      data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
    }


    return $.ajax(data).done(function(data) {

      if (_.isString(data)) {
        // to json
        if (JSON && JSON.parse) {
          data = JSON.parse(data);
        } else {
          data = $.parseJSON(data);
        }
      }

      //未登录
      if (data.code == 10004) {

        window.location.href = data.data;
      }

      if ($.isFunction(callback)) {
        //回调
        callback(data);
      }

    });
  },

  KeyUserList : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),

    urlType: "fetchServiceKeyUserList"

  })),
  AddKeyUser : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServiceKeyUserList"

  })),
  Step1 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServiceMemberInnerList"

  })),
  init : function(){

  }
};