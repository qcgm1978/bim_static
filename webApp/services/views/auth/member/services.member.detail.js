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
        this.getRole();//写入角色
        return this;
    },

    //取得成员和组织的角色列表
    getRole:function(){
        var userId = this.model.get("userId");
        var orgId = this.model.get("orgId");
        if(userId){
            var userUrl ="http://bim.wanda-dev.cn/platform/auth/user/"+ userId  +"/role?outer=" +  !(App.Services.MemberType == "inner");
            this.blendRole(userUrl,this.writeRole);
        }else if(orgId){
            if(orgId ==1){//根用户
                App.Services.role.loadData(this.writeRole);
                return
            }
            var orgUrl ="http://bim.wanda-dev.cn/platform/auth/org/"+ orgId  +"/role?outer=" +  !(App.Services.MemberType == "inner");
            this.blendRole(orgUrl,this.writeRole);
        }
    },

    //写入角色
    writeRole:function(response){
        var data = response.data,x=0;
        if(data && data.length){
            this.$(".roles").empty();
            for(var i = 0 ; i < data.length ; i++){
                if(data[i]["roleId"] == 999999){
                    this.$(".roles").append("<span class='" + "adm" +"'>" + data[i].name + "</span>" );
                }
            }
            //只写入5个
            for(var j = 0 ; j < data.length ; j++){
                var className = '';
                if(data[j]["inherit"]){className = "inherit"}
                if(data[j]["roleId"] == 999999){
                    j++;
                    continue
                }
                x = x+1;
                if(x >4){return}
                this.$(".roles").append("<span class='" + className +"'>" + data[j].name + "</span>" );
            }
        }
    },

    initialize:function(){
        this.model.set({"checked":false});//预先设置属性
        this.listenTo(this.model, 'checked:change', this.render);
    },

    //弹窗
    spread:function(){
        $("#dataLoading").show();
        var type =  App.Services.MemberType,_this =this;
        var frame = new App.Services.MemberWindowIndex().render().el;//外框
        //获取单选所选项的角色列表
        var userId = this.model.get("userId");
        var orgId  = this.model.get("orgId");
        var parentId = $("#ozList").find("span.active").parent(".ozName").data("id") || 1;//父项id
        //窗口及数据
        _this.window(frame);
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表
        //根用户
        if(orgId ==1 || parentId ==1){
            App.Services.role.loadData(function(){
                $("#dataLoading").hide();
            });
            return
        }

        //单选是清空数据选项，清空已选数据（包括列表数据和弹窗数据）
        App.Services.ozRole.collection.each(function(item){
            item.set("checked",false);
        });
        App.Services.Member[type + "Collection"].each(function(item){
            item.set("checked",false);
        });
        this.chooseSelf();//处理选中状态

        //保存弹窗数据方便提交
        var saveType =  App.Services.MemberType;
        if(saveType){
            if(userId){
                App.Services.memberWindowData[saveType].orgId.push(userId);
            }else if(orgId){
                App.Services.memberWindowData[saveType].orgId.push(orgId);
            }
        }

        //获取父项数据
        var url = "http://bim.wanda-dev.cn/platform/auth/org/"+ parentId  +"/role?outer=" +  !(App.Services.MemberType == "inner");
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

//加载角色
    blendRole:function(url,fn){
        var _this= this;
        $.ajax({
            type:"GET",
            url: url,
            success:function(response){
                if(response.message=="success"){
                    _this.function = response.data;//当前用户功能列表,不生效
                    if(fn && typeof fn == "function"){
                        fn(response);
                    }
                }
            },
            error:function(error){
                _this.$(".roles").addClass("error").html(_this.model.get("name")+"无法取得角色列表,错误： " + error.status);
            }
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
                    App.Services.ozRole.collection.reset();
                    _.each(response.data,function(item){
                        App.Services.ozRole.collection.add(item);
                    });
                    $("#dataLoading").hide();
                    if(frame){
                        _this.window(frame);
                    }
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
