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
        Backbone.on("resourcesChangeMappingRuleModelName",this.changeName,this);
    },

    changeName:function(){
        if(this.$(".item").attr("data-id") == App.ResourceArtifacts.Status.templateId){
            this.$(".item div").text(App.ResourceArtifacts.Status.templateName);
        }
    },
    //取得模板
    getTpl:function(){
        var _this = this;
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//保存id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//保存name
        App.ResourceArtifacts.resetModelRuleSaveData();//重置要保存的数据
        //保存状态
        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }

        this.toggleClass();

        Backbone.trigger("mappingRuleModelLoadContent",this.model.get("name"));


    },
    //切换
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    }
});