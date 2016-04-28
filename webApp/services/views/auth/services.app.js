/*
 * @require /service/views/Services.window.js
 */
var App = App || {};
App.Services.control={

    init:function(){
        $("#contain").html( new App.Services.nav().render().el);//基础框架

        //组织结构内容
        //App.Services.Member.init();

        //App.Services.memCtrloz .loadData();//加载组织列表
        //App.Services.memCtrlBlend.loadData();//加载成员列表
        //App.Services.memCtrloz.colletion.reset();//加载成员列表
        //App.Services.memCtrlBlend.colletion.reset();//加载成员列表
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理



        //角色管理
        //App.Services.role.init();
        //App.Services.role .loadData();//加载组织列表
        //App.Services.role.loadData();//加载成员列表
        //App.Services.role.colletion.reset();//加载成员列表
        //App.Services.role.colletion.reset();//加载成员列表


        //关键用户
        //App.Services.keyUser.init();
        //App.Services.keyUser .loadData();//加载组织列表
        //App.Services.keyUser.loadData();//加载成员列表
        //App.Services.keyUser.colletion.reset();//加载成员列表
        //App.Services.keyUser.colletion.reset();//加载成员列表


        //项目管理
        //App.Services.project.init();
        //App.Services.project .loadData();//加载组织列表
        //App.Services.project.loadData();//加载成员列表
        //App.Services.project.colletion.reset();//加载成员列表
        //App.Services.project.colletion.reset();//加载成员列表


        //弹窗
        //App.Services.window.init();//基础弹窗


    },

    //功能管理识别id判断将不显示某些项功能
    fun : function(){

    }
};

