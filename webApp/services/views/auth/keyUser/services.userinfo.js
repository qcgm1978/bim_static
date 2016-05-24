

var App = App || {};
App.Services.userinfo = Backbone.View.extend({

  el:'.keyBody',


  template:_.templateUrl("/services/tpls/auth/keyUser/services.userinfo.html"),

  events:{
    "click .proe .edit":'projedit',
    "click .oz .edit":'orgedit'


    //"click .keyUserList li":'toggleClass'
  },

  render:function(){

    //准备Collection的MODELS
    var datas={
      info : App.Services.KeyUser.fakedata || []

    };
    this.$el.html(this.template(datas));
    return this;
  },
  //修改项目
  projedit : function(){
    App.Services.KeyUser.clearAll();
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('edit').el);
    App.Services.KeyUser.html2=[];
  },
  //修改部门授权
  orgedit : function(){
    App.Services.KeyUser.orgId = [];
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('org').el);
  },
  initialize:function(){
    this.listenTo(App.Services.KeyUser.userinfo,'add',this.render);

  }

});