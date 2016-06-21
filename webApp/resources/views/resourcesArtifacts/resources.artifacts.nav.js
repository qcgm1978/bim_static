/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .default" : "create"

    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);

        App.ResourceArtifacts.Status.rule.biz = 1;
        var power = App.ResourceArtifacts.Settings.ruleModel;
        if(power == 1){
            this.$(".modularization").remove();
            this.$(".quality").addClass("active");
        }else if(power == 2){
            App.ResourceArtifacts.Status.rule.biz = 2;
            this.$(".quality").remove();
        }
        return this;
    },

    initialize:function(){
        Backbone.on("startFromProject",this.startFromProject,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("projectMappingRuleCheckedClose",this.checkClose,this);
        Backbone.on("resetRule",this.resetRule,this);
    },

    checkList:function(){
       this.$(".artifactsContent").addClass("edit");
    },

    checkClose:function(){
        this.$(".artifactsContent").removeClass("edit");
    },

    startFromProject:function(){
        //监听项目内容
    },

    //切换选项
    select:function(e){
        var $pre = $(e.target),_this = this;

        App.ResourceArtifacts.Status.saved = true;

        if($pre.closest(".artifactsNav").length){
            if(!$pre.hasClass("active")){
                $pre.addClass("active").siblings("li").removeClass("active");
            }
        }


        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//模块化
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }

            this.$(".qualifyC").hide();
            this.$(".qualifyC li").removeClass("active");
            this.$(".plans").show();

            this.resetRule();

        }else if(quality){//质量
            App.ResourceArtifacts.Status.rule.biz = 2 ;
            if(this.$(".default:visible").length){
                return
            }

            this.resetRule();

            this.$(".plans").hide();
            this.$(".qualifyC").show();
            this.$(".plans li").removeClass("active");
        }
        this.$(".rules").show();
    },
    //重置规则
    resetRule:function(){
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
        this.$(".rules h2 .name").html("没有选择模块/质量标准");
        this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
    },

    //为项目设置创建规则
    create:function(e){
        this.$(".default").hide();
        this.select(e);
    }
});