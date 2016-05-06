/*
 * @require  /services/views/auth/role/services.role.window.index.js
 */
App.Services.roleList=Backbone.View.extend({

    tagName:"div",
    className:"roleCtrl",

    events:{
        "click .newRole": "newRole"
    },
    template:_.templateUrl("/services/tpls/auth/role/services.role.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Services.role.collection,"add",this.addOne);
       this.listenTo(App.Services.role.collection,"remove",this.render);
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Services.roleDetail({model:model});
        this.$("#roleList").append(newView.render().el);
    },
    //创建新角色
    newRole:function(){
        App.Services.roleModify = false;
        //框架
        var frame = new App.Services.roleWindowIndex().render().el;
        //初始化窗口
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"新建角色",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            okCallback:function(){},
            cancelCallback:function(){},
            closeCallback:function(){},
            message:frame
        });
        //角色信息
        App.Services.roleFun.loadData({},function(){
        });
    },
    //排序
    comparator:function(){

    }
});




