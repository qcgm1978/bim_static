/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplFrame = Backbone.View.extend({

    tagName:"div",

    className: "artifactsTplFrame",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tplframe.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("mappingRuleModelLoadContent",this.loadContent,this);
        Backbone.on("mappingRuleResetModel",this.mappingRuleResetModel,this);
    },


    mappingRuleResetModel:function(){
        this.$(".tplContent>.default").show();
    },

    //写入内容
    loadContent:function(name){
        var _this = this;
        this.$(".tplContent").addClass("services_loading");
        //重置右侧列表
        this.detail = new App.Resources.ArtifactsTplDetail();
        this.menu = new App.Resources.ArtifactsMapRule();
        this.plans = new App.Resources.ArtifactsPlanList();
        this.planRule = new App.Resources.ArtifactsPlanRule();
        this.quality = new App.Resources.ArtifactsQualityList();//质量标准，外层
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle();  //规则头部

        this.$(".tplContent .content").html(this.detail.render().el);
        this.detail.$(".tplDetailCon").append(this.menu.render().el);//菜单
        this.menu.$(".plans").append(this.plans.render().el);//计划
        this.menu.$(".rules").append(this.planRuleTitle.render().el);//规则
        this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el);//规则列表
        this.menu.$(".qualifyC").append(this.quality.render().el);//质量

        $("#artifacts").addClass("tpl");//此处为修正样式表现

        //修改内容
        this.detail.$(".tplDetailTitle h2").text(name);
        this.detail.$(".tplDetailTitle .tplName").val(name);
        this.detail.$(".artifactsContent").addClass("explorer");
        this.detail.$(".artifactsContent .default").show().siblings().hide();


        this.$(".tplContent>.default").hide();
        //获取列表
        this.getTplRule();//获取规则模板列表
        App.ResourceArtifacts.getPlan();

        App.ResourceArtifacts.getAllQuality(function(){
            //生成
            App.ResourceArtifacts.departQuality(_this.menu.$(".qualityMenuListGC"),App.ResourceArtifacts.allQualityGC,null,"0");
            _this.menu.$(".qualityMenuListGC").show();
            App.ResourceArtifacts.departQuality(_this.menu.$(".qualityMenuListKY"),App.ResourceArtifacts.allQualityKY,null,"0");
        });
    },

    //获取模板规则列表
    getTplRule:function(){
        var _this = this;
        var pdata = {
            URLtype:"fetchArtifactsTemplateRule",
            data:{
                templateId : App.ResourceArtifacts.Status.templateId
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                    _this.menu.$(".plans").html(_this.plans.render().el);
                    _this.menu.$(".rules .ruleContent").html(_this.planRule.render().el);
                    App.ResourceArtifacts.TplCollectionRule.add(response.data);
                    $(".tplContent").removeClass("services_loading");
                    _this.menu.$(".artifactsContent .default").hide();
                    _this.menu.$(".artifactsContent .plans").show();
                    _this.menu.$(".artifactsContent .rules").show();
                }else{
                    //没有任何规则时候，创建规则按钮
                    _this.menu.$(".artifactsContent .default").siblings().hide();
                    $(".tplContent").removeClass("services_loading");
                }
            }
        })
    }
});