/**
 * @require /services/collections/auth/keyuser/keyuser.js
 */

var App = App || {};
App.Services.keyUserFrame = Backbone.View.extend({

    tagName:"div",

    className:"keyUserBody",

    template:_.templateUrl("/services/tpls/auth/keyUser/services.keyUser.html"),

    events:{
        "click .newKeyUsers":"newKeyUser",
        "click .keyUserList li":'toggleClass'
    },

    render:function(){

        //准备多个Collection的MODELS
        var datas={
            keyUser : App.Services.KeyUser.KeyUserList.toJSON() || [],

        };
        this.$el.html(this.template(datas));
        return this;
    },

    //切换active状态
    toggleClass:function(e){
        $(e.target).toggleClass('active').siblings().removeClass('active');
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    newKeyUser:function(){
        App.Services.maskWindow=new App.Comm.modules.Dialog({title:'新增关键用户',width:600,height:500,isConfirm:false})
        $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render().el);
        console.log($('.mod-dialog .content'))
    },

    add:function(){
       this.render()
    },
    initialize:function(){
        this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
    }
});

