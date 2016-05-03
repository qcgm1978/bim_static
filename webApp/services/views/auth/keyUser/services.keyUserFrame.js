/**
 * @require /services/collections/auth/keyUser/keyUser.js
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

        $("#mask").html(new App.Services.addKeyUser().render().el);
        //需要获取的数据
        //已选成员
        //已选角色
        //这里情况比较多，单个时候列表显示读取的个人角色？？？
        $("#mask").show();
    },

    add:function(){
       this.render()
    },
    initialize:function(){
        this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
    }
});

