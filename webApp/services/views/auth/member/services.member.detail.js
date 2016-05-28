/*
 * @require  /services/collections/auth/member/member.list.js
 * */
App.Services.memberDetail=Backbone.View.extend({
    tagName : 'li',
    className : 'choose',

    template:_.templateUrl("/services/tpls/auth/member/services.member.detail.html"),
    events:{
        "click .pers":"modify",
        "click .sele":"choose",
        "click .name":"loadMenu"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        //this.delegateEvents();
        return this;
    },

    initialize:function(){
        this.model.set({"checked":false});//预设选择状态
        this.listenTo(this.model, 'change:checked', this.render);
        this.listenTo(this.model, 'change:role', this.render);
    },

    //查找当前元素
    findSelf:function() {
        var _this =this;
        var parent = '';
        _.each($(".ozName"),function (item) {
            var id = $(item).data("id");
            if (id == _this.model.get("orgId")) {
                parent = $(item).parent("div").parent("li");
            }
        });
        return parent
    },
    cancelBubble:function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            window.cancelBubble = true;
        }
    },

    loadMenu:function(e){
        this.cancelBubble(e);
        if(App.Services.queue.que > 1 ){ return}
        if(this.model.get("userId")){return}//用户，可能需要另行处理
        var findSelf = this.findSelf(),
            _thisType = App.Services.MemberType,
            _thisId = App.Services.memFatherId =  this.model.get("orgId"),
            collection = App.Services.Member[_thisType + "Collection"];
        //样式操作
        $(".serviceOgList span").removeClass("active");
        findSelf.find(".ozName > span").addClass("active"); //this偏差导致选择不正确
        $("#blendList").empty();
        $(".serviceBody .content").addClass("services_loading");
        var cdata = {
            URLtype: "fetchServicesMemberList",
            type:"GET",
            data:{
                parentId:_thisId,
                outer:  !(_thisType == "inner"),
                includeUsers:true
            }
        };
        //此处为延迟
        App.Comm.ajax(cdata,function(response){
            var alreadyCon,alreadyMenu = findSelf.find(".childOz");//已加载菜单将不再加载

            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
                return
            }
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if(!response.data.org.length){
                if(!alreadyMenu.hasClass("alreadyGet")){
                    alreadyMenu.addClass("alreadyGet");
                }
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                //菜单渲染
                alreadyCon =  alreadyMenu.html();
                if(alreadyCon || alreadyMenu.hasClass("alreadyGet")){return;}
                alreadyMenu.html(App.Services.tree(response));
            }
        }).done(function(){
            App.Services.queue.next();
        });
    },

    //单个修改
    modify:function(e){
        this.cancelBubble(e);
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
//不可选状态
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
        $(".mod-dialog").css({"min-height": "545px"});
        $(".mod-dialog .wrapper .content").css({"min-height": "500px"});
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表
    }
});
