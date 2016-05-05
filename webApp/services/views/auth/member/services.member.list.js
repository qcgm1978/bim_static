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
        this.$el.empty();
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
       this.listenTo(App.Services.Member.innerCollection,"add",this.addOne);
       this.listenTo(App.Services.Member.outerCollection,"add",this.addOne);
       this.listenTo(App.Services.Member.innerCollection,"reset",this.render);
       this.listenTo(App.Services.Member.outerCollection,"reset",this.render);
    },
    //数据加载
    addOne:function(model){

        var newView = new App.Services.memberDetail({model:model});
        this.$("#blendList").append(newView.render().el);
    },

    //选中事件
    selectAll:function(){
        var type =  App.Services.MemberType;
        var $this = this;
        var preS= this.$(".head input")[0].checked;
        this.$(":checkbox").each(function(checkbox){
            checkbox.checked = preS;
            if(preS){
                $this.$("li").addClass("active");
                App.Services.Member[type + "Collection"].each(function(item){item.set({"checked":true})})
            }else{
                $this.$("li").removeClass("active");
                App.Services.Member[type + "Collection"].each(function(item){item.set({"checked":false})})
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

        //是否选择
        if(seleUser && !seleUser.length){
            alert("您没有选择任何成员或组织，无法设置角色！");return
        }

        //渲染框架
        var frame = new App.Services.MemberWindowIndex().render().el;

        //初始化窗口
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"角色授权",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            okCallback:function(){},
            cancelCallback:function(){},
            closeCallback:function(){},
            message:frame
        });

        //写入已选用户和组织
        _.each(seleUser,function(item){
            $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:item}).render().el);
        });

        this.saveData(seleUser); //保存弹窗数据相关数据便提交

        //角色列表
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);

        //无父项时获取缺省角色列表
        App.Services.role.loadData();
        //获取数据
        var data = {};
        //单选取得角色列表
        if(seleUser.length == 1){
            var getRole = this.getRole(seleUser[0]);
            data = {
                outer :  !(type == "inner"),
                orgId : getRole.id
            };
            //getRole.collection.loadData(data);
            return
        }
        //多选取得父项机构的角色列表
        //App.Services.ozRole.loadData(data);//此处需要判断父项id，父项id如何写入？
    },

    //保存要提交的数据模块，将数据混编成可提交形式
    saveData:function(seleUser){
        var saveType =  App.Services.MemberType;
        //userId和orgId
        _.each(seleUser,function(item){
            var userId = item.get("userId");
            var orgId = item.get("orgId");
            if(saveType){
                if(userId){
                    App.Services.memberWindowData[saveType].orgId.push(userId);
                }
                if(orgId){
                    App.Services.memberWindowData[saveType].orgId.push(orgId);
                }
            }
        });
    },

    //返回机构/成员的url和id
    getRole:function(model){
        var id = model.get("userId");
        if(id){
            return {collection:App.Services.userRole,id:id};//返回指定用户的角色列表，使用不同的collection,使用同一view，父项只能是组织
        }else if(model.get("orgId")){
            return {collection:App.Services.ozRole,id:id};//返回指定机构的角色列表
        }
    },
    //排序
    comparator:function(){}
});