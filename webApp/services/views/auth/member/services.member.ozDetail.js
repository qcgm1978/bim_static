/*
 * @require  /services/views/auth/member/services.member.list.js
 * */
App.Services.MemberozDetail=Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/services/tpls/auth/member/services.member.ozDetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
        //this.listenTo(this.model,"change:active",this.sele)
    },

    sele:function(){
        if(this.model.get("active")){
            this.$(".ozName").addClass("active");
            this.$(".ozName span").addClass("active");//选中状态
        }
    },

    unfold:function(){
        //如果已选则返回
        if(this.$(".ozName span").hasClass("active")){
            return
        }

        var _this = this;
        var _thisType = App.Services.MemberType;
        var _thisId = this.$(".ozName").data("id");
        var collection = App.Services.Member[_thisType + "Collection"];
        $("#blendList").empty();//刷新右侧数据

        var data = {
            outer:  !(_thisType == "inner"),
            parentId:_thisId,
            includeUsers:false
        };

        //获取数据，将会刷新右侧视图
        App.Services.Member.loadData(collection,data,function(response){

            //菜单
            if (response.data.org.length) {
                //样式处理
                _this.$("div").remove("active");
                $(".ozName").addClass("active");
                $(".serviceOgList span").removeClass("active");//唯一选项
                _this.$(".ozName > span").addClass("active");//选中状态
                //如果有则清空直接子列表？？结构不正确
                //菜单渲染
                _this.$(".childOz" + _thisId).html(new App.Services.MemberozList(response.data.org).render().el);
            }
        });








        ////不刷新
        //var _this =this;
        //var _thisId = this.$(".ozName").data("id");
        //var _thisTpye = this.$(".ozName").data("type");//内部还是外部用户
        //_thisId = _thisId ? _thisId : "";//没有则显示根
        //
        //var data = {
        //    outer: _thisTpye,
        //    parentId: _thisId//父项ID
        //};
        //
        //App.Services.Member.loadData(App.Services.Member[_thisTpye + "Collection"],data,function(response){
        //    //如果已有则重置并重新获取数据
        //    $(".childOz" +_thisId).empty();
        //
        //    //左面删除已选
        //    $(".serviceOgList div").removeClass("active");
        //    $(".serviceOgList span").removeClass("active");//唯一选项
        //
        //    //选中状态
        //    _this.$(".ozName").addClass("active");
        //    _this.$(".ozName span").addClass("active");//选中状态
        //
        //    //添加子菜单
        //    if(response.data.org.length) {
        //        $(".childOz" + _thisId).html(new App.Services.MemberozList(response.data.org).render().el);
        //    }
        //});
    }
});

