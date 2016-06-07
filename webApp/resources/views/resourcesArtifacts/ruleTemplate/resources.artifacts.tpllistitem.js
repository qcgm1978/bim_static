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
    },

    //取得模板
    getTpl:function(){
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//保存id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//保存id

        //保存状态
        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }
        this.toggleClass();



        //重置右侧列表
        var detail = new App.Resources.ArtifactsTplDetail();
        var pre = new App.Resources.ArtifactsMapRule();  //外层菜单
        var plans = new App.Resources.ArtifactsPlanList();   //模块化列表 /计划节点
        var planRule = new App.Resources.ArtifactsPlanRule();  //默认规则
        $(".tplContent").html(detail.render().el);
        detail.$(".tplDetailCon").append(pre.render().el);//菜单
        pre.$(".plans").html(plans.render().el);//计划节点
        pre.$(".rules .ruleContent").html(planRule.render().el);//映射规则
        $("#artifacts").addClass("tpl");

        //this. tplDetail();

    },

    //切换
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    },


//获取模板
    tplDetail:function() {
        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsTemplateRule",
            data:{
                templateId: this.model.get("id")
            }
        };
        //App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){

            if(response.code == 0 ){

                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.reset();
                    $(".artifactsContent .rules ul").empty();
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    $(".ruleContent ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
                }
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    }
});