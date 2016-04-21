/*
 * @require  /service/js/collection/memCtrl.blendList.js
 * */
var App = App || {};
App.Service.MemCtrlBlendDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/service/tpls/mem/service.MemCtrl.blendDetail.html"),
    events:{
        "click .pers":"spread",
        "click input":"select"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.model.set({"selected":false});
        this.listenTo(this.model, 'change', this.render);
    },

    //向点击的部分传递ID,请求数据
    spread:function(){
        $("#mask").empty();

        //外壳及相关信息
        App.Service.window.init();
        $(".serviceWindow").append(new App.Service.windowMem().render().el);//外框
        $(".serviceWindow h1").html("角色授权");

        //写入当前用户
        var $this = this;
        $(".serviceWindow .aim ul").append(new App.Service.window.BlendDetail({model:$this.model}).render().el);
        $(".memRoleList").append(new App.Service.windowRoleList().render().el);


        //处理角色列表已选部分
        App.Service.role.loadData(function(){
            var preSelected = $this.model.get("role");//已选角色
            //没效果，collection异步所以异步执行无数据
            App.Service.role.collection.each(function(item){
                for(var i = 0 ; i < preSelected.length ; i++){
                    if(item.get("roleId") == preSelected[i]["roleId"]){
                        item.set({"checked":true});
                    }
                }
            });
            //获取角色列表
            $("#mask").show();
        });

    },

    select:function(){
        var boolean = this.$("input")[0].checked;
        if(boolean){
            this.$el.addClass("active");
            //向模型添加属性
            this.model.set({"selected":boolean});
        }else{
            this.$el.removeClass("active");
            this.model.set({"selected":boolean});
        }
    }
});




