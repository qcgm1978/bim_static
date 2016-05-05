/*
 * @require  /services/collections/auth/member/member.list.js
 * */
App.Services.memberWindowData = {"roleId":[], "outer":{"orgId":[],"userId":[]},"inner":{"orgId":[], "userId":[]}};//提交数据
App.Services.memberDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/member/services.member.detail.html"),
    events:{
        "click .pers":"spread",
        "click .left":"choose"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        //写入角色
        this.getRole();
        return this;
    },

    //返回机构/成员的url和id
    getRole:function(){
        var userId = this.model.get("userId");
        var orgId = this.model.get("orgId");
        if(userId){
                //获取成员角色
        }
        if(orgId){
            //获取机构角色
        }
    },

    initialize:function(){
        this.model.set({"selected":false});//预先设置属性
        this.listenTo(this.model, 'change', this.render);
    },


    //弹窗
    spread:function(){

        var type =  App.Services.MemberType;

        //获取单选所选项的角色列表
        var userId = this.model.get("userId");
        var orgId  = this.model.get("orgId");


        //单选是清空数据选项，清空已选数据（包括列表数据和弹窗数据）
        App.Services.ozRole.collection.each(function(item){
            item.set("checked",false);
        });
        App.Services.Member[type + "Collection"].each(function(item){
            item.set("checked",false);
        });
        this.chooseSelf();//处理选中状态


        var frame = new App.Services.MemberWindowIndex().render().el;//外框

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


        //当前用户
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:this.model}).render().el);

        //保存弹窗数据方便提交
        var saveType =  App.Services.MemberType;
        if(saveType){
            if(userId){
                App.Services.memberWindowData[saveType].orgId.push(userId);
            }else if(orgId){
                App.Services.memberWindowData[saveType].orgId.push(orgId);
            }
        }

        //有父项时，取得父项机构的角色列表,无父项时获取缺省角色列表
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);
        App.Services.role.loadData();
        var data = {outer:!(type =="inner"),id :"id"};//id值需考虑左面菜单，注意
        App.Services.roleType.loadData(App.Services.roleType.orgCollection,data);
    },

    //已选部分，当弹窗加载时使用当前成员的角色列表，将弹窗的父角色内与当前成员角色重叠的部分设置为已选
    chooseSelf:function(){
        //当选择其他时候，点击当前会将提示信息和选择信息设置为当前这个
        $("#blendList li").removeClass("active");
        //选中当前
        this.$el.addClass("active");
        this.model.set("checked",true);

    },

   //选择选项时作的操作。
    choose:function(){
        var boolean = this.model.get("checked");
        if(!boolean){
            this.$el.addClass("active");
        }else{
            this.$el.removeClass("active");
        }
        this.model.set({"checked": !boolean});
    }
});
