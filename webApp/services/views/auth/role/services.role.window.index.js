/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleWindowIndex = Backbone.View.extend({

    tagName:"div",
    className:"seWinBody",
    template:_.templateUrl("/services/tpls/auth/windows/services.role.window.index.html"),
    events:{
        "click .windowSubmit":"windowSubmit"
    },
    render:function(){
        this.$el.html(this.template());
        return this;
    },
    //验证
    initialize:function(){
        this.listenTo(App.Services.roleFun.collection,"add",this.addOne);
        this.listenTo(App.Services.roleFun.collection,"reset",this.render);
    },
    addOne:function(model){
        var newView = new App.Services.roleWindowFunDetail({model:model});
        this.$("#funList").append(newView.render().el);
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    windowSubmit:function(){
        $("#mask").hide().empty();//外层
        //获取选中的功能，将功能id加入数组
        //选中时将数组写入functionId
        //POST  https://bim.wanda.cn/platform/auth/role
        var funArray = [];
        var data = {
                "name": "角色名",//角色名称
                "functionId": funArray//功能ID数组
        };
        //发送个人id，加载模块
        //弹出window，获取并插入功能列表数据
    }
});
