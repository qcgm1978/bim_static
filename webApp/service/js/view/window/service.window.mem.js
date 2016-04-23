/*
 * @require /service/js/view/window/service.mem.window.js
 * */
var App = App || {};
App.Service.windowMem=Backbone.View.extend({

    tagName:"div",

    className:"seWinBody",

    template:_.templateUrl("/service/tpls/window/service.window.mem.html"),

    events:{
        "click .windowSubmit":"windowSubmit"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    windowSubmit:function(){
        $("#mask").hide().empty();//外层
        //需要获取的数据
        //已选成员
        //已选角色
        //这里情况比较多，单个时候列表显示读取的个人角色？？？
    },

    initialize:function(){
    }
});
