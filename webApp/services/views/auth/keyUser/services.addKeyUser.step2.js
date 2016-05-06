

var App = App || {};
App.Services.step2 = Backbone.View.extend({

  tagName:'div',

  className:'step2',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step2.html"),

  events:{
    "click li":"changeStatus",
    //"click .keyUserList li":'toggleClass'
  },

  render:function(){
    //准备Collection的MODELS
    var datas={
      direction : App.Services.KeyUser.Step2.toJSON() || [],

    };
    this.$el.html(this.template(datas));
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step2,'add',this.render)
  },

  //打开或关闭目录
  changeStatus:function(e){
      var $li;
      //选定项目
      if($(e.target).parent().hasClass('project')){
        $li = $(e.target).parent();
      }else{
        $li = $(e.target).parent().parent();
      }
      $li.toggleClass('selected-proj');



  }
});