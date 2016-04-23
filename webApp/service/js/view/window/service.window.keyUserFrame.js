/*
 * @require /service/js/role/service.role.list.js
 * */
var App = App || {};
App.Service.windowKeyUserFrame = Backbone.View.extend({

    tagName:"div",

    className:"keyUserBody",

    template:_.templateUrl("/service/tpls/window/service.window.keyUserFrame.html"),

    events:{
        "click .windowSubmit":"windowSubmit",
        "click .windowClose":"windowClose"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    windowSubmit:function(){
        $("#mask").hide().empty();//外层
    },

    windowClose:function(){
        $("#mask").hide().empty();//外层
    },

    initialize:function(){
        //console.log(this.template);
    }
});
