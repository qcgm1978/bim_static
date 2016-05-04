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

        //this.loadData("outer");
        App.Services.MemberType = "outer";
        this.loadData();
        //App.Services.Member.loadData(App.Services.Member.outerCollection);
    },
    //内部用户
    inner:function(){

        //this.loadData("inner");
        App.Services.MemberType = "inner";

        //App.Services.Member.loadData(App.Services.Member.innerCollection);
        this.loadData();
    },


    //加载子组织，刷新右侧组织和员工列表
    loadData:function(){

        var _thisType = App.Services.MemberType;
        var collection = App.Services.Member[_thisType + "Collection"];

        $("#blendList").empty();//清空右侧列表
        //输入数据

        //获取数据，将会刷新右侧视图
        App.Services.Member.loadData(collection,{},function(response){
            //菜单
            if (response.data.org && response.data.org.length) {
                //样式处理
                this.$("div").remove("active");
                $("#" + _thisType).addClass("active");
                $(".serviceOgList span").removeClass("active");//唯一选项
                $("#" + _thisType + " > span").addClass("active");//选中状态
                //如果有则清空直接子列表？？结构不正确
                this.$(".childOz").empty();
                //菜单渲染
                this.$("#" + _thisType +"+ .childOz").html(new App.Services.MemberozList(response.data.org).render().el);
            }
        });
    }
});
