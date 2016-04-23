/*
 * @require /service/js/view/window/service.window.funDetail.js
 * */
var App = App || {};
App.Service.windowRole=Backbone.View.extend({

    tagName:"div",

    className:"winBody",

    template:_.templateUrl("/service/tpls/window/service.window.role.html"),

    events:{
        "click .windowSubmit":"windowSubmit"
    },
    render:function(){
        this.$el.html(this.template());
        return this;
    },

    //验证
    initialize:function(){
        this.listenTo(App.Service.fun.collection,"add",this.addOne);
        this.listenTo(App.Service.fun.collection,"reset",this.render);

    },
    addOne:function(model){
        var newView = new App.Service.windowFunDetail({model:model});
        this.$("#funList").append(newView.render().el);  //不识别除ID之外的·······fk
    },


    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    windowSubmit:function(){
        $("#mask").hide().empty();//外层

        //获取选中的功能，将功能id加入数组
        //选中时将数组写入functionId
        //POST  https://bim.wanda.cn/platform/auth/role
        var funArray = [];
        var data = {
            urlType: "fetchServiceFunList",
            set:{
                "name": "角色名",//角色名称
                "functionId": funArray//功能ID数组
            }
        };
        App.Comm.ajax(data,"POST",function(response){
            /*{
             "code": 0,
             "message": "success",
             "data": {
             "roleId": 807715914271904, //角色ID
             "name": "施工角色2", //角色名称
             "functions": [ //该角色拥有的功能ID列表
             {
             "id": 1,   //功能ID
             "name": "设计", //功能名称
             "code": "design" //功能code
             }
             ]
             }
             }*/
            //重新获取角色列表
        });

        //发送个人id，加载模块
        //弹出window，获取并插入功能列表数据
    }
});
