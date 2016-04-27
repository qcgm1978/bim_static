/*
 * @require  /Service/js/collection/memCtrl.blendList.js
 * */
var App = App || {};
App.Service.nav = Backbone.View.extend({

    el:$("#contains"),
    template:_.templateUrl("/Service/tpls/service.Nav.html",true),

    events:{
        "click .memCtrl" : "memCtrl",
        "click .roleCtrl" : "roleCtrl",
        "click .keyUser" : "keyUser",
        "click .memProject" : "memProject"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },
//面包屑
    breadCrumb : function(ele){
        $(ele).addClass("active").siblings("li").removeClass("active");
        var n = $(ele).index();
        var text = this.$el.find("li").eq(n).text();
        this.$el.find(".bcService span").eq(2).text(text);
    },

    initialize:function(){

        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    },



    memCtrl : function(e){
        $(".serviceBody").empty();
        this.breadCrumb(this.$el.find(".memCtrl"));
        App.Service.memCtrlBlend.init();

        //load模板  主模板  //弹窗模板  //弹窗模板为公共
    },
    roleCtrl : function(e){
        $(".serviceBody").empty();
        this.breadCrumb(this.$el.find(".roleCtrl"));
        App.Service.role.init();
        //主模板   角色列表      角色修改和删除（删除配置？？？删除的弹窗提示）      //弹窗模板  列表  ，input角色名和选择角色功能。
    },
    keyUser : function(e){
        $(".serviceBody").empty();
        this.breadCrumb(this.$el.find(".keyUser"));
        //主模板  四个列表：  关键用户列表 （默认第一个？）  关键要用户基本信息  项目权限   部门权限
        //新增关键用户，注意步骤，关联性
        //删除关键用户弹窗
        //项目授权  权限，两个列表（注意关联性）
        //部门授权
        //弹窗主模板相同，名称可能不同，需要主模板管理器（标题，副标题，内容刷新底下按钮）
    },
    memProject : function(e){
        $(".SserviceBody").empty();
        this.breadCrumb(this.$el.find(".memProject"));
        //项目成员主模板
        //添加成员可与上面模板相同
        //删除提示
    }
});

