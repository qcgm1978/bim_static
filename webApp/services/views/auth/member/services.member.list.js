/*
 * @require  /services/views/auth/member/services.member.detail.js
 */

App.Services.MemberList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",//批量授权
        "click .selectAll":"selectAll"//全选
    },

    template:_.templateUrl("/services/tpls/auth/member/services.member.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Services.Member[App.Services.MemberType + "Collection"],"add",this.addOne);
       this.listenTo(App.Services.Member[App.Services.MemberType + "Collection"],"reset",this.render);
        //$el为包含模板的元素，el为元素节点
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Services.memberDetail({model:model});
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
                App.Services.Member.innerCollection.each(function(item){item.set({"checked":true})})
            }else{
                $this.$("li").removeClass("active");
                App.Services.Member.innerCollection.each(function(item){item.set({"checked":false})})
            }
        })
    },

    batchAward:function(){

        var type =  App.Services.MemberType;
        //获取所选项
        var seleUser = App.Services.Member[type + "Collection"].filter(function(item){
            if(item.get("checked")){
                return item.get("checked");
            }
        });

        if(!seleUser.length){alert("您没有选择任何成员或组织，无法设置角色！");return}

        var frame = new App.Services.MemberWindowIndex().render();


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
            message:frame.el
        });


        //写入已选用户和组织
        _.each(seleUser,function(item){
            $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:item}).render().el);
        });

        //已选组织的父项的角色列表
        //$(".memRoleList").append(new App.Services.windowRoleList().render().el);

        var data = {};
        App.Services.ozRole.loadData(data,function(){});

    },

    //排序
    comparator:function(){

    }

});




