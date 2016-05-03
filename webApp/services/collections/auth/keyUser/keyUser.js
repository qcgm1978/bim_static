/**
 * @require /services/collections/index.es6
 */

App.Services.KeyUser = {

  loadData : function(collection,data,fn) {

    data = data || {};
    collection.reset();
    collection.fetch({
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


    urlType: "fetchServiceStep1"

  })),
  init : function(){

  }
};