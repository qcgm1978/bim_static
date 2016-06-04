/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //this.listenTo(App.ResourceArtifacts.Status.presentPlan,"chang",this.getChangeAttr);    //监听展开的模型是否被更改，如果更改，列出更改项，提示保存
    },

    //取得模型修改过的属性
    getChangeAttr:function(e){
        console.log("模型已被更改");
    },

    //取得规则列表
    getDetail:function(){
        var  code = this.model.get("code");
        if(!code){
            //判断是否为新建规则，新建规则如何处理？
            return;
        }
        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }
        this.toggleClass();
        this. getRules();
        //保存计划规则
        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;
    },
//切换计划
    toggleClass:function(){
        $(".qualityMenu li").removeClass("active");
        this.$el.closest("li").addClass("active");
    },

    //获取质量标准相关规则
    getRules:function() {
        var _this = this,pdata;
        if(!App.ResourceArtifacts.Status.saved){
            //提示有没有保存现在的，重要
            return
        }
        if(this.model.get("leaf")){

            //修改右侧名称

            //存在，加载二级或三级标准
            pdata = {
                URLtype : 'fetchQualityPlanQualityLevel2',

                data : {
                    type : 1,
                    standardType:"GC",
                    parentCode :this.model.get("code")
                }
            };
            App.Comm.ajax(pdata,function(response){
                if(response.code == 0 && response.data.length){
                    var list = App.Resources.artifactsQualityTree(response.data);
                    _this.$el.closest("li").find(".childList").html(list);
                }
            });
            return
        }

        this.

        $(".artifactsContent .rules ul").empty();
        //刷新右面视图
        var code = this.model.get("code");
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                biz:2
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanRules.reset();
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                App.ResourceArtifacts.PlanRules.add(response.data);
            }
        });
    }
});