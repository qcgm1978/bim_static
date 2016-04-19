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

       // this.listenTo(this.model, 'destroy', this.removeItem);
        //默认根据角色权限加载 3个 adm用户加载全部，keyMem用户只显示项目管理
    },

    //向点击的部分传递ID,请求数据
    spread:function(){
        $("#mask").empty();

        //外壳及相关信息
        App.Service.window.init();
        $(".serviceWindow").append(new App.Service.windowMem().render().$el);//外框
        $(".serviceWindow h1").html("角色授权");

        //写入当前用户
        //用户角色需要写入当前li中
        var $this = this;
        $(".serviceWindow .aim ul").append(new App.Service.window.BlendDetail({model:$this.model}).render().$el);


        //获取角色列表
        $("#mask").show();
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




