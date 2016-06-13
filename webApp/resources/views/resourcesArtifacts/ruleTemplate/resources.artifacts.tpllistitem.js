/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplListItem = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllistitem.html"),

    events:{
        "click .item":"getTpl"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"remove",this.render);
    },
    //取得模板
    getTpl:function(){

        var _this = this;
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//保存id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//保存name

        //保存状态
        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }
        this.toggleClass();

        $(".tplContent").addClass("services_loading");
        //重置右侧列表
        this.detail = new App.Resources.ArtifactsTplDetail();
        this.menu = new App.Resources.ArtifactsMapRule();
        this.plans = new App.Resources.ArtifactsPlanList();
        this.planRule = new App.Resources.ArtifactsPlanRule();
        this.quality = new App.Resources.ArtifactsQualityList();//质量标准，外层
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle();  //规则头部

        $(".tplContent").html(this.detail.render().el);
        this.detail.$(".tplDetailCon").append(this.menu.render().el);//菜单
        this.menu.$(".plans").append(this.plans.render().el);//计划
        this.menu.$(".rules").append(this.planRuleTitle.render().el);//计划
        this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el);//计划
        this.menu.$(".qualifyC").append(this.quality.render().el);//质量



        $("#artifacts").addClass("tpl");//此处为修正样式表现

        //修改内容
        $(".tplDetailTitle h2").text(this.model.get("name"));
        $(".tplDetailTitle .tplName").val(this.model.get("name"));


        _this.menu.$(".artifactsContent .default").show().siblings().hide();
        //获取列表
        this.getTplRule();//获取规则模板列表
        App.ResourceArtifacts.getPlan();
        App.ResourceArtifacts.getQuality();
    },
    //切换
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
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