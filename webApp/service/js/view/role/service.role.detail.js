/*
 * @require  /service/js/collection/role.list.js
 * */
var App = App || {};
App.Service.roleDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/service/tpls/role/service.role.detail.html"),
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
    },


    modify:function(){
        App.Service.window.init();

        $(".serviceWindow").append( new App.Service.windowRole().render().el);

        //没起作用
        var $this =this;
        //值
        var func= this.model.get("functions");
        App.Service.fun.loadData(function(){

            $("#selectedRoleName").val($this.model.get("name")).attr("disabled","disabled"); //暂时写入
            console.log($("#selectedRoleName").val());

            App.Service.fun.collection.each(function(item){
                for(var i = 0 ; i < func.length ; i ++){
                    if(item.get("id") == func[i]["id"]){
                        item.set({"checked":true});
                        return
                    }
                }
            });
        });//异步获取功能数据


        $("#mask").show();
        //请求个人角色列表设置,
        //获取数据轮询，如果与角色列表相同则勾选选项
    },

    delete:function(){
        //删除需判断状态，由什么来判断？
        App.Service.role.collection.remove(this.model);
    }
});




