

var App = App || {};
App.Services.step1 = Backbone.View.extend({

  tagName:'div',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step1.html"),

  events:{
    "click p":"changeStatus",
    //"click .keyUserList li":'toggleClass'
  },

  render:function(){
    //准备Collection的MODELS
    var datas={
      direction : App.Services.KeyUser.Step1.toJSON() || [],

    };
    this.$el.html(this.template(datas));
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step1,'add',this.render)
  },

  //打开或关闭目录
  changeStatus:function(e){
    
    var $ul=$(e.target).siblings('ul');
    if($ul.hasClass('shut')){
      $ul.removeClass('shut').addClass('open');
    }else{
      $ul.removeClass('open').addClass('shut');
    }
  }
});