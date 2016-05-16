/*
 * @require  /services/collections/auth/member/member.list.js
 * */
App.Services.memberDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/member/services.member.detail.html"),
    events:{
        "click .pers":"modify",
        "click .left":"choose"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.delegateEvents();
        return this;
    },

    initialize:function(){
        this.model.set({"checked":false});//预设选择状态
        this.listenTo(this.model, 'change:checked', this.render);
        this.listenTo(this.model, 'change:role', this.render);

    },

    //单个修改
    modify:function(){
        var _this =this,disable,selected;
        $(".serviceBody .content").addClass("services_loading");
        var frame = new App.Services.MemberWindowIndex().render().el;//外框
        _this.window(frame);
        _this.chooseSelf();
        _this.save();

        //获取所有列表，就可以了，继承项设置不可修改
        App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){
            $(".serviceBody .content").removeClass("services_loading");
            var role = _this.model.get("role");
            if(role && role.length) {
                selected  = _.filter(role,function(item){
                    return !item.inherit
                });
                _this.selected(selected);
                disable = _.filter(role,function(item){
                    return item.inherit
                });
                _this.disable(disable);
            }
            App.Services.maskWindow.find(".memRoleList h2 i").text(role.length);
        });

    },

    disable:function(arr){
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    item.set("inherit", true);
                }
            }
        });
    },

    //已选状态
    selected:function(arr){
        var n = 0;//统计
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    if(arr[i]["inherit"]){
                        item.set("inherit", true);
                        return
                    }
                    item.set("checked", true);
                }
            }
        });
        return n;
    },

    //加载父项数据
   /* getData:function(parent){
        var _this =this,type =  App.Services.MemberType || "inner";
        var datas  ={
            URLtype:"fetchServicesOzRoleList",
            data:{
                orgId:parent.data("id"),
                outer:!(type == "inner")
            },
            type:"GET"
        };
        App.Comm.ajax(datas,function(response){
            if(response.message=="success"){
                $("#dataLoading").hide();
                var role = _this.model.get("role");
                if(!response.data.length){$(".seWinBody .memRoleList ul").append("<li>没有相关数据!</li>");}
                App.Services.Member.SubRoleCollection.reset();
                _.each(response.data,function(item){
                    App.Services.Member.SubRoleCollection.add(item);
                });
                if(role && role.length) {
                    _this.selected(role);
                }
            }
        });
    },*/

    //保存数据到全局变量
    save:function(){
        var type =  App.Services.MemberType || "inner",
            data =  App.Services.memberWindowData,
            userId = this.model.get("userId"),
            orgId  = this.model.get("orgId");
        if(userId){
            data[type].userId.push(userId);
        }else if(orgId){
            data[type].orgId.push(orgId);
        }
        App.Services.Member.saveMemData(data);
    },

    //已选部分，当弹窗加载时使用当前成员的角色列表，将弹窗的父角色内与当前成员角色重叠的部分设置为已选
    chooseSelf:function(){
        var type =  App.Services.MemberType || "inner";
        App.Services.Member.SubRoleCollection.each(function(item){
            item.set("checked",false);
        });
        App.Services.Member[type + "Collection"].each(function(item){
            item.set("checked",false);
        });
        $("#blendList li").removeClass("active");
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
    },

    //初始化窗口
    window:function(frame){
        var _this =this;
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"角色授权",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Services.Member.resetMemData();
            },
            message:frame
        });
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表
    }
});
