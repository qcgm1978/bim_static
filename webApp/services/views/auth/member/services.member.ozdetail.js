/*
 * @require  /services/views/auth/member/services.member.list.js
 * */
App.Services.MemberozDetail=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.orgdetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change:active",this.sele)
    },

    sele:function(){
        if(this.model.get("active")){
            this.$(".ozName").addClass("active");
            this.$(".ozName span").addClass("active");
        }
    },

    unfold:function(){

        var _this =  this,container = this.$el.siblings(".childOz");
        //如果是快速点击，属于误操作，跳过
        if(!App.Services.queue.permit){return;}
        if(App.Services.queue.que > 2 ){ return}

        //选择和加载状态
        if(this.$(".ozName span").hasClass("active")){  //已选（必然已加载），收起
            if(App.Services.queue.que.length){return}
            this.$(".ozName").removeClass("active").find("span").removeClass("active");
            App.Services.queue.certificates();
            //清空右侧列表
            $("#blendList").html("<li><span class='sele'>没有选择任何组织，请点击左侧组织名选择</span></li>");
            container.hide();
            return
        }
        if(container.html()){   //未选但已加载，选择，显示已加载项
            if(!container.is(":hidden")){
                container.find(".childOz").hide();
                $(".ozName").removeClass("active").find("span").removeClass("active");
                $("#blendList").html("<li><span class='sele'>没有选择任何组织，请点击左侧组织名选择</span></li>");
                container.hide();
                return}
            $(".outer span").removeClass("active");
            $(".inner span").removeClass("active");
            $(".ozName span").removeClass("active");//清除内部所有的激活的元素
            container.find(".childOz").hide();
            this.$el.find(".ozName").addClass("active").find("span").addClass("active");
            container.show();
        }else{ //未加载 ，移除所有加载项再选择和显示
            $(".ozName span").removeClass("active");
            $(".outer span").removeClass("active");
            $(".inner span").removeClass("active");
            this.$(".ozName").addClass("active").find("span").addClass("active");
            container.show();
        }
        App.Services.queue.promise(_this.pull,_this);
    },

    //队列请求
    pull:function(){
        var _this = App.Services.queue.present[0];
        var _thisType = App.Services.MemberType;
        var _thisId = App.Services.memFatherId =  _this.$(".ozName").data("id") ;
        var collection = App.Services.Member[_thisType + "Collection"];
        //样式操作
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
            var alreadyMenu = _this.$el.siblings(".childOz");//已加载菜单将不再加载

            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
                Backbone.trigger("servicesMemberControlCancelSelectAll");
                return
            }
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                if(alreadyMenu.html()){return}//判断不再刷新菜单
                alreadyMenu.html(App.Services.tree(response));
            }
        }).done(function(){
            //删除执行完毕的 ，添加执行新的
             App.Services.queue.next();
        });
    }
});