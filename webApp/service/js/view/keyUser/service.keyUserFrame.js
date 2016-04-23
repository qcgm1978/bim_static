/*
 * @require /service/js/view/window/service.window.keyUserFrame.js
 * */
var App = App || {};
App.Service.keyUserFrame = Backbone.View.extend({

    tagName:"div",

    className:"keyUserBody",

    template:_.templateUrl("/service/tpls/keyUser/service.keyUser.html"),

    events:{
        "click .newKeyUser":"newKeyUser"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    newKeyUser:function(){
        //$("#mask").hide().empty();//外层

        $("#mask").html(new App.Service.windowKeyUserFrame().render().el);
        //需要获取的数据
        //已选成员
        //已选角色
        //这里情况比较多，单个时候列表显示读取的个人角色？？？
        $("#mask").show();
    },

    initialize:function(){
        //console.log(this.template);
    }
});
