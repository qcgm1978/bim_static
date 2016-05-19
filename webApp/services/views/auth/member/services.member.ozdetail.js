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
        var _this =  this;
        //如果是已有元素，并快速点击，属于误操作，跳过
        if(this.$(".ozName span").hasClass("active") && !App.Services.queue.permit){return;}
        //许可证相关
        App.Services.queue.promise(_this.pull,_this);

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
    pull:function(){

        var _this = App.Services.queue.present[0];
        var _thisType = App.Services.MemberType;
        var _thisId = App.Services.memFatherId =  _this.$(".ozName").data("id") ;
        var collection = App.Services.Member[_thisType + "Collection"];


        //样式操作
        $(".serviceOgList span").removeClass("active");
        _this.$(".ozName > span").addClass("active"); //this偏差导致选择不正确
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
            var alreadyCon,alreadyMenu = $("#childOz" + _this.model.cid);//已加载菜单将不再加载

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
            //删除执行完毕的 ，添加执行新的
             App.Services.queue.next();
        });
    }
});

