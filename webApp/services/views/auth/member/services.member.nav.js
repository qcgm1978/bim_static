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
        App.Services.MemberType = "outer";
        $("#dataLoading").show();
        this.init();
    },
    //内部用户
    inner:function(){
        App.Services.MemberType = "inner";
        $("#dataLoading").show();
        this.init();
    },
    //加载子组织，刷新右侧组织和员工列表
    init:function(){
        var _thisType = App.Services.MemberType,
            _this =this,
            collection = App.Services.Member[_thisType + "Collection"];
        //获取数据，将会刷新右侧视图
        App.Services.Member.loadData(collection,{},function(response){
            //菜单
            if (response.data.org && response.data.org.length) {
                //样式处理
                _this.$("div").removeClass("active");
                $("#" + _thisType).addClass("active");
                $(".serviceOgList span").removeClass("active");//唯一选项
                $("#" + _thisType + " > span").addClass("active");//选中状态
                //如果有则清空直接子列表
                //_this.$(".childOz").empty();
                //菜单渲染
                $("#" + _thisType +"+ .childOz").html(new App.Services.MemberozList(response.data.org).render().el);
            }
            if(!response.data.org.length){
                $("#blendList").html("<li>&nbsp;&nbsp;&nbsp;&nbsp;暂无数据!</li>");
            }
            $("#dataLoading").hide();
        });
    }
});
