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
        return this;
    },

    initialize:function(){
        this.model.set({"checked":false});//预先设置属性
        this.listenTo(this.model, 'change:checked', this.render);
        this.listenTo(this.model, 'change:role', this.render);
    },

    //弹窗
    spread:function(){
        var url,_this =this;
        $("#dataLoading").show();
        var type =  App.Services.MemberType || "inner";
        var frame = new App.Services.MemberWindowIndex().render().el;//外框
        //获取单选所选项的角色列表
        var userId = this.model.get("userId");
        var orgId  = this.model.get("orgId");
        var parent = $("#ozList").find("span.active").parent(".ozName");//父项id


        //窗口及数据
        _this.window(frame);
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表




        //单选是清空数据选项，清空已选数据（包括列表数据和弹窗数据）
        App.Services.Member.SubRoleCollection.each(function(item){
            item.set("checked",false);
        });
        App.Services.Member[type + "Collection"].each(function(item){
            item.set("checked",false);
        });
        this.chooseSelf();//处理选中状态


        //保存弹窗数据方便提交
        if(userId){
            App.Services.memberWindowData[type].userId.push(userId);
        }else if(orgId){
            App.Services.memberWindowData[type].orgId.push(orgId);
        }

        //根用户
        if(!parent.data("id")){
            App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){
                $("#dataLoading").hide();
            });
            return
        }



        //获取父项数据
        url = "http://bim.wanda-dev.cn/platform/auth/org/"+ parent.data("id")   +"/role?outer=" +  !(type == "inner");
        this.ajaxRole(url,frame,function(response){
            //获取自身数据
            //因为接口无法设置角色，所以此处暂停
            _.each(_this.function,function(item){
                for(var i = 0 ; i< response.data.length ; i++){
                    if(item["roleId"] == response.data[i]["roleId"]){
                        response.data[i]["checked"] = true;
                    }
                }
            });
            $("#dataLoading").hide();
        });
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
    },

    window:function(frame){
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
    },

//弹窗角色
    ajaxRole:function(url,frame,fn){
        var _this=this;
        $.ajax({
            type:"GET",
            url: url,
            success:function(response){
                if(response.message=="success"){
                    if(!response.data.length){$(".seWinBody .memRoleList ul").append("<li>没有相关数据!</li>");}
                    App.Services.Member.SubRoleCollection.reset();
                    _.each(response.data,function(item){
                        App.Services.Member.SubRoleCollection.add(item);
                    });
                    $("#dataLoading").hide();
                    if(fn && typeof fn =="function"){
                        fn(response);
                    }
                }
            },
            error:function(error){
                alert("无法取得角色列表,错误号 " +error.status );
                $("#dataLoading").hide();
            }
        });
    }
});
