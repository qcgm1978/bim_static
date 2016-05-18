/*
 * @require  /services/views/auth/member/services.member.ozList.js
 */

App.Services.MemberNav=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.nav.html"),
    events:{
        "click #outer":'outer',
        "click #inner":'inner'
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    },
    //外部用户
    outer:function(){
        var _this =this;
        App.Services.MemberType = "outer";
        $(".serviceBody .content").addClass("services_loading");
        App.Services.queue.promise(_this.pull,_this);
    },
    //内部用户
    inner:function(){
        var _this =this;
        App.Services.MemberType = "inner";
        $(".serviceBody .content").addClass("services_loading");
        App.Services.queue.promise(_this.pull,_this);
    },
    //加载子组织，刷新右侧组织和员工列表
    pull:function(){
        var _thisType = App.Services.MemberType,
            cdata,
            _this = App.Services.queue.present[0],
            collection = App.Services.Member[_thisType + "Collection"];

        _this.$("div").removeClass("active");
        $("#" + _thisType).addClass("active");
        $(".serviceOgList span").removeClass("active");//唯一选项
        $("#" + _thisType + " > span").addClass("active");//选中状态

        $("#blendList").empty();


        cdata = {
            URLtype: "fetchServicesMemberList",
            type:"GET",
            data:{
                outer:  !(_thisType == "inner"),
                includeUsers:true
            }
        };

        App.Comm.ajax(cdata,function(response){

            //样式处理

            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
                return
            }

            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                _this.$(".childOz").empty();
                collection.add(response.data.org);
                //外部和内部单选

                //菜单渲染
                $("#" + _thisType +"+ .childOz").html(App.Services.tree(response));
            }
        }).done(function(){
            App.Services.queue.next();
        });


        //获取数据，将会刷新右侧视图
        /*App.Services.Member.loadData(collection,{},function(response){
            //菜单
            if (response.data.org && response.data.org.length) {
                //样式处理
                _this.$("div").removeClass("active");
                $("#" + _thisType).addClass("active");
                $(".serviceOgList span").removeClass("active");//唯一选项
                $("#" + _thisType + " > span").addClass("active");//选中状态
                //外部和内部单选
                _this.$(".childOz").empty();
                //菜单渲染
                $("#" + _thisType +"+ .childOz").html(App.Services.tree(response));
            }
            if(!response.data.org.length){
                $("#blendList").html("<li>&nbsp;&nbsp;&nbsp;&nbsp;暂无数据!</li>");
            }
            $(".serviceBody .content").removeClass("services_loading");
        });*/
    }
});
