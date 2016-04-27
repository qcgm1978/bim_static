/*
 * @require  /service/js/collection/role.list.js
 */

var App = App || {};
App.Service.roleList=Backbone.View.extend({

    tagName:"div",

    className:"roleCtrl",

    events:{
        "click .newRole": "createRole"
    },

    template:_.templateUrl("/Service/tpls/role/service.role.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Service.role.collection,"add",this.addOne);

        //$el为包含模板的元素，el为元素节点
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Service.roleDetail({model:model});
        this.$("#roleList").append(newView.render().el);
    },


    //创建新角色
    createRole:function(){

        //前期菜单准备
        App.Service.window.init();
        $(".serviceWindow").append(new App.Service.windowRole().render().$el);//外框
        $("#mask").show();
        App.Service.fun.loadData();


    },

    //排序
    comparator:function(){

    }
});




