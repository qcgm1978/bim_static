/*
 * @require  /services/views/auth/member/services.member.list.js
 * */
App.Services.MemberozDetail=Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/services/tpls/auth/member/services.member.ozdetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
        this.listenTo(this.model,"change:active",this.sele)
    },

    sele:function(){
        if(this.model.get("active")){
            this.$(".ozName").addClass("active");
            this.$(".ozName span").addClass("active");//选中状态
        }
    },

    unfold:function(){
        var _this = this;
        var _thisType = App.Services.MemberType;
        var _thisId = this.$(".ozName").data("id");
        if($("#childOz" + _thisId).siblings(".ozName").find("span").hasClass("active")){return}
        var collection = App.Services.Member[_thisType + "Collection"];
        $("#blendList").empty();//刷新右侧数据
        $("#dataLoading").show();

        var data = {
            outer:  !(_thisType == "inner"),
            parentId:_thisId,
            includeUsers:true
        };
        //获取数据，将会刷新右侧视图
        App.Services.Member.loadData(collection,data,function(response){
            //菜单
            if (response.data.org && response.data.org.length) {
                //样式处理
                _this.$("div").remove("active");
                $(".ozName").addClass("active");
                $(".serviceOgList span").removeClass("active");
                _this.$(".ozName > span").addClass("active");
                _this.$(".childOz").empty();

                //菜单渲染
                $("#childOz" + _thisId).html(new App.Services.MemberozList(response.data.org).render().el);
            }
            if(!response.data.org.length && !response.data.user.length ){
                $("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
            }
            $("#dataLoading").hide();
        });
    }
});

