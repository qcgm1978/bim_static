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
        this.getCategoryCode(); //获取分类编码
        Backbone.on("startFromProject",this.startFromProject,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("projectMappingRuleCheckedClose",this.checkClose,this);
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

    select:function(e){
        var $pre = $(e.target),_this = this;

        if(!App.ResourceArtifacts.Status.saved ){
            alert("请先保存！");
        }

        if($pre.closest(".artifactsNav").length){
            $pre.addClass("active").siblings("li").removeClass("active");
        }


        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//模块化
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }


            this.$(".qualifyC").hide();
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
        }
        this.$(".rules").show();
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
    //重置规则
    resetRule:function(){
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
        this.$(".rules h2 .name").html("没有选择模块/质量标准");
        this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>没有选择模块/质量标准</div></li>");
    },

    //为项目设置创建规则
    create:function(e){
        this.$(".default").hide();
        this.select(e);
    }
});