/*
 * @require  /service/views/mem/Services.MemCtrlChildList.js
 * */
var App = App || {};
App.Services.MemberNav=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.nav.html"),
    events:{
        "click .outer":'outer',
        "click .inner":'inner'
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
        this.loadData(true,"outer");
        //App.Services.ozRole.loadData();//获取父项数据
    },
    //内部用户
    inner:function(){
        this.loadData(false,"inner");
        //App.Services.ozRole.loadData();//获取父项数据
    },


    loadData:function(options,self){
        var dataObj = {
            URLtype: "fetchServiceMCBlendList",
            data: {
                outer: options,//是否外部
                //parentId: ""//父项ID
            }
        };
        App.Services.Member.collection.reset();

        App.Comm.ajax(dataObj,function(response){


            if(response.message == "success") {


                App.Services.Member.setter(response);//设定特征


                $("#blendList").empty();
                //组织
                if (response.data.org.length) {
                    //样式处理
                    this.$("div").remove("active");
                    $("." + self).addClass("active");
                    $(".serviceOgList span").removeClass("active");//唯一选项
                    $("." + self + " > span").addClass("active");//选中状态
                    //状态清空
                    this.$(".childOz").empty();


                    for(var z = 0 ;z < response.data.org.length ; z++){
                        response.data.org[z].type = options;         //设定类型,内部还是外部
                    }
                    //数据和渲染
                    App.Services.Member.collection.reset();
                    App.Services.Member.collection.add(response.data.org);
                    this.$("." + self +"+ .childOz").html(new App.Services.MemberozList(response.data.org).render().el);
                }
            }
        });
    }
});
