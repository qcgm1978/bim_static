/*
 * @require  /service/js/collection/role.list.js
 * */
var App = App || {};
App.Service.roleDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/Service/tpls/role/service.role.detail.html"),
    events:{
        //"click .explorer":"explorer",
        "click .modify":"modify",
        "click .delete":"delete"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model, 'change', this.render);
        this.$el.hover(function(){$(this).addClass("active");},function(){$(this).removeClass("active")});
       // this.listenTo(this.model, 'destroy', this.removeItem);
    },




    modify:function(){
        App.Service.window.init();
        this.model.set("selected",true);

        var funView = new App.Service.windowRole().render().$el;
        $(".serviceWindow").append(funView);//外框
        $(".serviceWindow .aim input").val(this.model.get("name")).attr("disabled","disabled"); //暂时写入

        var $this = this;
        var coll = Backbone.Collection.extend({model:App.Service.funModel});//此处模型需要重新定义
        var selected = new coll($this.model.get("functions"));
        //App.Service.fun.collection.add(newColl.models);  //data需要排序，将已选的放到前面

        App.Service.fun.loadData(selected.models);//异步获取功能数据





        $("#mask").show();
        //请求个人角色列表设置,
        //获取数据轮询，如果与角色列表相同则勾选选项
    },

    delete:function(){
        //删除需判断状态，由什么来判断？
        App.Service.role.collection.remove(this.model);
    }
});




