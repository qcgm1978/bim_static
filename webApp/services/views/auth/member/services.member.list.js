/*
 * @require  /services/views/auth/member/services.member.detail.js
 */

App.Services.MemberList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",
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

    //批量授权
    batchAward:function(){
        var _this =this;

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

        $("#dataLoading").show();
        //渲染框架
        var frame = new App.Services.MemberWindowIndex().render().el;
        //写入已选用户和组织
        _.each(seleUser,function(item){
            $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:item}).render().el);
        });

        this.saveData(seleUser); //缓存弹窗数据相关数据便提交

        //角色列表
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);


        var fatherId = $("#ozList").find("span.active").parent(".ozName").data("id");

        //无父项时获取缺省角色列表
        if(!fatherId){
            App.Services.role.loadData(function(){
                $("#dataLoading").show();
                _this.window(frame);
            });
            return;
        }

    //数据
        var roleData = {
            data: {
                outer:!(type == "inner")
            }
        };

        //单选取得角色列表
        if(seleUser.length == 1) {
            var getRole = this.getRole(seleUser[0]);
            if (getRole.userId) {
                roleData.data.userId = getRole.userId;
                //roleData.URLtype = "fetchServicesUserRoleList";

                //用户
                $.ajax({
                    type:"GET",
                    url:"https://bim.wanda.cn/platform/auth/user/"+ getRole.userId  +"/role",
                    success:function(response){
                        if(response.message=="success"){
                            App.Services.ozRole.collection.reset();
                            _.each(response.data,function(item){
                                App.Services.ozRole.collection.add(item);
                            });
                            $("#dataLoading").hide();
                            _this.window(frame);
                        }
                    },
                    error:function(){
                        alert("无法取得角色列表");
                        $("#dataLoading").hide();
                        _this.window(frame);
                    }
                });

                //组织
            }else if(getRole.orgId){
                roleData.data.orgId = getRole.orgId;
                roleData.data.outer = !type;
                //roleData.URLtype = "fetchServicesOzRoleList";
                $.ajax({
                    type:"GET",
                    url:"https://bim.wanda.cn/platform/auth/org/"+ getRole.orgId  +"/role?outer=" + roleData.data.outer ,
                    success:function(response){
                        if(response.message=="success"){
                            App.Services.ozRole.collection.reset();
                            _.each(response.data,function(item){
                                App.Services.ozRole.collection.add(item);
                            });
                            $("#dataLoading").hide();
                            _this.window(frame);
                        }
                    },
                    error:function(){
                        alert("无法取得角色列表");
                        $("#dataLoading").hide();
                        _this.window(frame);
                    }
                });
            }
                return
        }

        //多选取得父项机构的角色列表
        roleData.data.orgId = fatherId;
       // roleData.URLtype = "fetchServicesOzRoleList";
        $.ajax({
            type:"GET",
            url:"https://bim.wanda.cn/platform/auth/org/"+ fatherId  +"/role?outer=" +  roleData.data.outer ,
            success:function(response){
                if(response.message=="success"){
                    App.Services.ozRole.collection.reset();
                    _.each(response.data,function(item){
                        App.Services.ozRole.collection.add(item);
                    });
                    $("#dataLoading").hide();
                    _this.window(frame);
                }
            },
            error:function(){
                alert("无法取得角色列表");
                $("#dataLoading").hide();
                _this.window(frame);
            }
        });

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
            return {userId:id};//返回指定用户的角色列表，使用不同的collection,使用同一view，父项只能是组织
        }else if(model.get("orgId")){
            return {orgId:id};//返回指定机构的角色列表
        }
    },

    //弹窗管理
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
    //排序
    comparator:function(){}
});