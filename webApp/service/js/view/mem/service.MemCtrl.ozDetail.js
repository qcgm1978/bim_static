/*
 * @require  /service/js/collection/model.js
 * */
var App = App || {};
App.Service.MemCtrlozDetail=Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/service/tpls/mem/service.MemCtrl.ozDetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理
    },

    unfold:function(){

        var $this = this;
        var $thisData = this.$(".ozName").data("id");
        if($thisData){
            var dataObj = {
                URLtype: "fetchServiceMCBlendListMn",//去掉mn正确
                data: {
                    outer: true,
                    parentId: $thisData//父项ID
                }
            };
            //获取 人员数据，如果无人员return，添加到collection，设置类型为员工
            //获取 组织数据，如果无组织return，添加到collection，设置类型为组织
            App.Comm.ajax(dataObj,function(response){
                $this.$(".childOz" +$thisData).empty();
                //获取组织

                App.Service.memCtrlBlend.collection.reset();
                $("#blendList").empty();
                //reset数据
                if(response.data.user.length){
                    App.Service.memCtrlBlend.collection.add(response.data.user);//员工
                }
                if(response.data.org.length){
                    //左面组织逻辑
                    $(".serviceOgList div").removeClass("active");
                    $(".serviceOgList span").removeClass("active");//唯一选项
                    //if($this.$("span").hasClass("active"))return;//已选刷新
                    $this.$(".ozName").addClass("active");
                    $this.$("span").addClass("active");//选中状态
                    $this.$(".childOz" + $thisData).html(new App.Service.MemCtrlChildList(response.data.org).render().el);

                    App.Service.memCtrlBlend.collection.add(response.data.org);//组织
                }
            });
        }
    }
});

