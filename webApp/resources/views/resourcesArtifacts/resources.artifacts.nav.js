/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .newPlanRule":"newPlanRule"
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
        //需要清空当前列表
        this.$(".ruleContent ul").html("<li><div class='ruleTitle delt'>没有选择模块/质量标准</div></li>");


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
    },

    //创建规则
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;
        if(!targetCode){
            alert("您还没有选择模块/质量标准");
            return;
        }//没有选择计划无法创建规则

        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            //查找未保存的元素并高亮提示变红
            return
        }
        if(!$(".ruleDetail").length){
            $(".artifactsContent .rules ul").html("");
        }
        //无数据或无更改，更改当前数据
        $(".ruleDetail:visible").hide();
        //创建规则

        var model =  App.ResourceArtifacts.createPlanRules();
        App.ResourceArtifacts.PlanRules.push(model);

        var container = new App.Resources.ArtifactsPlanRuleDetail({model:model}).render();

        //加载底下规则
        var operatorData = App.Resources.dealStr(model);//规则数据
        container.$(".mapRule dl").html("");
        _.each(operatorData,function(item){
            var model = new App.ResourceArtifacts.operator(item);
            var view = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
            container.$(".mapRule dl").append(view);
        });


        $(".artifactsContent .rules ul li:last-child").html(container.el).show();
        $(".artifactsContent .rules ul li:last-child .ruleDetail").show();

        App.ResourceArtifacts.Status.saved = false;
    }
});