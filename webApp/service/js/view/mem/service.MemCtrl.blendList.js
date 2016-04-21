/*
 * @require  /service/js/view/mem/service.memCtrl.blendDetail.js
 */

var App = App || {};
App.Service.MemCtrlBlendList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",//批量授权
        "click .selectAll":"selectAll"//全选
    },

    template:_.templateUrl("/service/tpls/mem/service.MemCtrl.blendList.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Service.memCtrlBlend.collection,"add",this.addOne);
       this.listenTo(App.Service.memCtrlBlend.collection,"reset",this.render);
        //$el为包含模板的元素，el为元素节点
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Service.MemCtrlBlendDetail({model:model});
        this.$("#blendList").append(newView.render().el);
    },

    //选中事件
    selectAll:function(){
        var $this = this;
        var preS= this.$(".head input")[0].checked;
        this.$(":checkbox").each(function(){
            this.checked = preS;
            if(preS){
                $this.$("li").addClass("active");
                App.Service.memCtrlBlend.collection.each(function(item){item.set({"selected":true})})
            }else{
                $this.$("li").removeClass("active");
                App.Service.memCtrlBlend.collection.each(function(item){item.set({"selected":false})})
            }
        })
    },

    batchAward:function(){
        $("#mask").empty();
        App.Service.window.init();
        console.log(new App.Service.windowMem().render().el);
        $(".serviceWindow").append(new App.Service.windowMem().render().el);//外框
        $(".serviceWindow h1").html("角色授权");

        //已选列表
       /* var $this=this;
         this.sele = new Backbone.Collection();
        App.Service.memCtrlBlend.collection.each(function(item){
            if(item.get("selected")){
                $this.add(item);
            }
        });*/

        //App.Comm.ajax();//取得data和function
        //发送个人id，加载模块
        //如果
        $("#mask").show();
    },

    //获取当前所选项，此处取消，此处由模型触发
    getSelected:function(){
        var arr =[];
        //批量处理,查找已选元素
        this.$(":checkbox").each(function(){
            if($(this).is("checked")){
                //发送请求获取列表？还是存储在直接存储在列表data
            }
        });
    },


    //排序
    comparator:function(){

    }


});




