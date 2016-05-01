/*
 * @require  /services/views/auth/member/services.role.detail.js
 */

var App = App || {};
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
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Services.roleDetail({model:model});
        this.$("#roleList").append(newView.render().el);
    },
    //创建新角色
    newRole:function(){
        //初始化窗口
        App.Services.batchAwardWindow = new App.Comm.modules.Dialog({
            title:"角色授权",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            okCallback:function(){},
            cancelCallback:function(){},
            closeCallback:function(){},
            message:"新建角色"
        });

    },

    //排序
    comparator:function(){

    }
});




