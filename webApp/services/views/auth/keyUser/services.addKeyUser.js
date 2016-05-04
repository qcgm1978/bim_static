App.Services.addKeyUser = Backbone.View.extend({

  tagName:"div",

  className:"serviceWindow",

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.html"),

  events:{
    "click .windowClose":"close",
    "click .up,.next":'changeStep'
  },

  render:function(step){


    this.$el.html(this.template());
    if(step){

    }else{
      this.$el.find('.up').hide();
      this.$el.find('.confirm').hide();
      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

      App.Services.KeyUser.loadData(App.Services.KeyUser.Step1,'',function(r){
        console.log(r)

        if(r && !r.code && r.data){
          _.each(r.data.org,function(data,index){
            data.shut = true;
            data.canLoad = true;
          });
          App.Services.KeyUser.org[0]=r.data.org;
          App.Services.KeyUser.Step1.set(r.data.org);
          console.log(r.data)
        }
      });
    }
    return this;
  },

  //切换步骤页
  changeStep  : function(){
alert('gg')
  },

  //关闭窗口
  close : function(){

    $('#mask').hide();

  },


  initialize:function(){
    //this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
  }

});