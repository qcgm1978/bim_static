/*
 * @require  /services/collections/auth/member/member.list.js
 * */
App.Services.memberDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/member/services.member.detail.html"),
    events:{
        "click .pers":"spread",
        "click .left":"choose"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.model.set({"selected":false});//预先设置属性
        this.listenTo(this.model, 'change', this.render);
    },

    //弹窗
    spread:function(){

        var type =  App.Services.MemberType;
        //获取所选项
        //var seleUser = App.Services.Member[type + "Collection"].filter(function(item){
        //    if(item.get("checked")){
        //        return item.get("checked");
        //    }
        //});

        //获取单选所选项的角色列表
        var userId = this.model.get("userId");
        var orgId  = this.model.get("orgId");

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


        //comm/js/modules/modules.dialog.js
        //$(".serviceWindow").append(new App.Services.windowMem().render().el);//外框

        var $this = this;
        $("#mask").empty();
        //外壳及相关信息
        ////写入当前用户
        //$(".serviceWindow .aim ul").append(new App.Services.window.BlendDetail({model:$this.model}).render().el);
        //$(".memRoleList").append(new App.Services.windowRoleList().render().el);
        this.chooseSelf();//清理旧的和选中新的
        ////处理角色列表已选部分
        //App.Services.ozRole.loadData({},function(){
        //    var preSelected = $this.model.get("role");//已选角色
        //    //没效果，collection异步所以异步执行无数据
        //    App.Services.ozRole.collection.each(function(item){
        //        item.unset("checked");//清除痕迹
        //        for(var i = 0 ; i < preSelected.length ; i++){
        //            if(item.get("roleId") == preSelected[i]["roleId"]){
        //                item.set({"checked":true});
        //                return
        //            }
        //        }
        //    });
        //    $("#mask").show();
        //});

    },

    //已选部分，当弹窗加载时使用当前成员的角色列表，将弹窗的父角色内与当前成员角色重叠的部分设置为已选
    chooseSelf:function(){
        //当选择其他时候，点击当前会将提示信息和选择信息设置为当前这个
        $("#blendList li").removeClass("active");
        //App.Services.Member[+"Collection"].each(function(item){
        //    item.unset("checked");
        //});
        //选中当前
        this.$el.addClass("active");
        this.model.set("checked",true);
    },

   //选择选项时作饿的操作。
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
