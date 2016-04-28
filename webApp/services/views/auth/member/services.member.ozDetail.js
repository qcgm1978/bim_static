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
        var _this =this;
        var _thisId = this.$(".ozName").data("id");
        _thisId = _thisId ? _thisId : "";//父项ID
        var _thisTpye = this.$(".ozName").data("type");//内部还是外部用户

        this.model.set({"active":true});//模型状态


        var data = {
            outer: _thisTpye,
            parentId: _thisId//父项ID
        };

        App.Services.Member.loadData(App.Services.Member[_thisTpye + "Collection"],data,function(response){
            //如果已有则重置并重新获取数据
            $(".childOz" +_thisId).empty();

            //左面删除已选
            $(".serviceOgList div").removeClass("active");
            $(".serviceOgList span").removeClass("active");//唯一选项

            //选中状态
            _this.$(".ozName").addClass("active");
            _this.$(".ozName span").addClass("active");//选中状态

            //添加子菜单
            if(response.data.org.length) {
                $(".childOz" + _thisId).html(new App.Services.MemberozList(response.data.org).render().el);
            }
        });
    }
});

