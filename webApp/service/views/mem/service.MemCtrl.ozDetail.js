/*
 * @require  /service/collection/model.js
 * */
var App = App || {};


App.Service.MemCtrlozDetail=Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/service/tpls/mem/service.memCtrl.ozDetail.html"),
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
        var $this =this;
        var $thisData = this.$(".ozName").data("id");

        this.model.set({"active":true});//模型状态

        if($thisData){
            var dataObj = {
                URLtype: "fetchServiceMCBlendListMn",//去掉mn正确
                data: {
                    outer: true,
                    parentId: $thisData//父项ID
                }
            };

            App.Comm.ajax(dataObj,function(response){

                $(".childOz" +$thisData).empty();
                //获取组织

                App.Service.memCtrlBlend.collection.reset();
                $("#blendList").empty();

                //App.Service.parentOz = $this.model;  //缓存父组织模型在service.MemCtrl.bledList.js使用

                App.Service.memCtrlBlend.setter(response);//设定特征

                //reset数据
                if(response.data.user.length){
                    App.Service.memCtrlBlend.collection.add(response.data.user);//员工
                }
                if(response.data.org.length){
                    //左面删除已选
                    $(".serviceOgList div").removeClass("active");
                    $(".serviceOgList span").removeClass("active");//唯一选项
                    //将collection内容设置为未选

                    $this.$(".ozName").addClass("active");
                    $this.$(".ozName span").addClass("active");//选中状态

                    $(".childOz" + $thisData).html(new App.Service.MemCtrlChildList(response.data.org).render().el);

                    App.Service.memCtrlBlend.collection.add(response.data.org);//组织
                }
            });
        }
    }
});

