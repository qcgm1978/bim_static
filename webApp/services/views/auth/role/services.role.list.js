/*
 * @require  /services/auth/collection/role.list.js
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
        //前期菜单准备
        App.Service.window.init();//窗口
        $(".serviceWindow").append(new App.Service.windowRole().render().$el);//外框
        App.Service.fun.loadData();
        $("#mask").show();

    },

    //排序
    comparator:function(){

    }
});




