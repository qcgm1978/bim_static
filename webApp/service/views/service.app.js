/*
 * @require /service/views/service.window.js
 */
var App = App || {};
App.Service.control={

    init:function(){
        $("#contain").html( new App.Service.nav().render().$el);//基础框架
        //弹窗

        //组织结构内容
        App.Service.memCtrlBlend.init();

        //App.Service.memCtrloz .loadData();//加载组织列表
        //App.Service.memCtrlBlend.loadData();//加载成员列表
        //App.Service.memCtrloz.colletion.reset();//加载成员列表
        //App.Service.memCtrlBlend.colletion.reset();//加载成员列表
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理



        //角色管理
        //App.Service.role.init();
        //App.Service.role .loadData();//加载组织列表
        //App.Service.role.loadData();//加载成员列表
        //App.Service.role.colletion.reset();//加载成员列表
        //App.Service.role.colletion.reset();//加载成员列表


        //关键用户
        //App.Service.keyUser.init();
        //App.Service.keyUser .loadData();//加载组织列表
        //App.Service.keyUser.loadData();//加载成员列表
        //App.Service.keyUser.colletion.reset();//加载成员列表
        //App.Service.keyUser.colletion.reset();//加载成员列表


        //项目管理
        //App.Service.project.init();
        //App.Service.project .loadData();//加载组织列表
        //App.Service.project.loadData();//加载成员列表
        //App.Service.project.colletion.reset();//加载成员列表
        //App.Service.project.colletion.reset();//加载成员列表


        //弹窗
        //App.Service.window.init();//基础弹窗


    },

    //功能管理识别id判断将不显示某些项功能
    fun : function(){

    },

    //自动处理router
    router:function(){

    }
};

