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

        //队列机制，尚未完成
        if(App.Services.queue.length){
            if(App.Services.queue.length > 2){
                App.Services.queue.pop(-1);
                App.Services.queue.push(this.promise);
            }
        }

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

    //请求
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
            if(App.Services.queue){
                App.Services.queue.shift(0);
                if(App.Services.queue[0]){
                    App.Services.queue[0]();
                }
            }
        });
    }
});

