

var App = App || {};
App.Services.userinfo = Backbone.View.extend({

  el:'.keyBody',


  template:_.templateUrl("/services/tpls/auth/keyUser/services.userinfo.html"),

  events:{
    //"click  p":"changeStatus",
    //"click .keyUserList li":'toggleClass'
  },

  render:function(){

    //准备Collection的MODELS
    var datas={
      info : App.Services.KeyUser.fakedata || [],

    };
    this.$el.html(this.template(datas));
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.userinfo,'add',this.render)
  },

});