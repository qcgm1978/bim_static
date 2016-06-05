/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select"
    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.getCategoryCode(); //获取分类编码
    },

    select:function(e){
        var pre = $(e.target),_this =this;
        if(pre.hasClass("active")){
            return
        }

        //重置数据，导致每次重新获取映射规则
        var planRule = new App.Resources.ArtifactsPlanRule();
        this.$(".rules").html(planRule.render().el);//菜单

        if(pre.hasClass("modularization")){//模块化

            App.ResourceArtifacts.Status.rule.biz = 2 ;

            this.$(".qualifyC").empty().hide();
            var plans = new App.Resources.ArtifactsPlanList();
            $(".breadcrumbNav .mappingRule").show();
            this.$(".plans").html(plans.render().el);//计划节点
            App.ResourceArtifacts.getPlan();
            this.$(".plans").show();

        }else if(pre.hasClass("quality")){//质量

            App.ResourceArtifacts.Status.rule.biz = 1 ;

            this.$(".plans").empty().hide();

            var quality = new App.Resources.ArtifactsQualityList().render().el;
            this.$(".qualifyC").html(quality);




            var pdata = {
                URLtype:'fetchQualityPlanQualityLevel1',
                data:{
                    type:App.ResourceArtifacts.Status.type,
                    standardType: "GC"
                }
            };

            App.ResourceArtifacts.getQuality(pdata,_this);
            this.$(".qualifyC").show();
        }
        pre.addClass("active").siblings("li").removeClass("active");
    },

    getCategoryCode:function(){
        var cdata  = {
            URLtype:'fetchArtifactsCategoryRule',
            data :{
            }
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    }
});