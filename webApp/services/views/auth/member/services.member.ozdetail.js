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
        var _this = this;

        //如果是已有元素，并快速点击，属于误操作，跳过
        if(this.$(".ozName span").hasClass("active") && !App.Services.queue.permit){return;}

        //队列机制，尚未完成
        if(!App.Services.queue.permit){
            if(App.Services.queue.que.length > 1){
                App.Services.queue.que.splice(1);
            }
            App.Services.queue.que.push(this.promise);
            return
        }

        //许可证相关
        App.Services.queue.permit = false;
        this.permit(); //200ms后发放一个许可证，避免点击过快

        //样式操作
        $(".serviceOgList span").removeClass("active");
        _this.$(".ozName > span").addClass("active");
        $("#blendList").empty();//刷新右侧数据
        $(".serviceBody .content").addClass("services_loading");
        

        this.promise();
        //获取数据，将会刷新右侧视图
        /*App.Services.Member.loadData(collection,data,function(response){
            //菜单
            if (response.data.org && response.data.org.length) {

                //菜单渲染
                $("#childOz" + _this.model.cid).html(App.Services.tree(response));
            }
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
            }
            $(".serviceBody .content").removeClass("services_loading");
        });*/
    },

    //队列请求
    promise:function(){
        var _this = this;
        var _thisType = App.Services.MemberType;
        var _thisId = App.Services.memFatherId =  this.$(".ozName").data("id") ;

        var collection = App.Services.Member[_thisType + "Collection"];
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
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
                $(".serviceBody .content").removeClass("services_loading");
                return
            }
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                //菜单渲染
                $("#childOz" + _this.model.cid).html(App.Services.tree(response));
            }
            $(".serviceBody .content").removeClass("services_loading");
        }).done(function(){
            //添加执行队列
             App.Services.queue.que.splice(0,0);
            if(App.Services.queue.que.length){
                App.Services.queue.que[0]();
            }
        });
    },

    permit:function(){
        setTimeout(function(){
            App.Services.queue.permit = true;
        },1000);
    }
});

