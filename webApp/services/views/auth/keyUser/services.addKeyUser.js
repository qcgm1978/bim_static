App.Services.addKeyUser = Backbone.View.extend({

  tagName:"div",

  className:"serviceWindow",

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.html"),

  events:{
    "click .windowClose":"close",
    "click .keyUserList li":'toggleClass'
  },

  render:function(step){


    this.$el.html(this.template());
    if(step){

    }else{

      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

      App.Services.KeyUser.loadData(App.Services.KeyUser.Step1,'',function(r){
        console.log(r)

        if(r && !r.code && r.data){
          App.Services.KeyUser.Step1.set(r.data);
          console.log(r.data)
        }
      });
    }
    return this;
  },

  //关闭窗口
  close : function(){

    $('#mask').hide();

  },


  initialize:function(){
    //this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
  }

});