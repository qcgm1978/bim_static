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

    select:function(e){
        var pre = $(e.target);
        if(pre.hasClass("active")){
            return
        }

        //��������
        var planRule = new App.Resources.ArtifactsPlanRule();

        if(pre.hasClass("modularization")){
            //ģ�黯
            this.$(".qualifyC").empty().hide();
            var plans = new App.Resources.ArtifactsPlanList();
            $(".breadcrumbNav .mappingRule").show();

            this.$(".plans").html(plans.render().el);//�ƻ��ڵ�
            this.$(".rules").html(planRule.render().el);//�˵�
            App.ResourceArtifacts.getPlan();

            this.$(".plans").show();
        }else if(pre.hasClass("quality")){
            this.$(".plans").empty().hide();
            //����
            var quality = new App.Resources.ArtifactsQualityList().render().el;
            this.$(".qualifyC").html(quality);

            //���ù��򲿷�
            this.$(".rules").html(planRule.render().el);//�˵�

            App.ResourceArtifacts.getQuality();
            this.$(".qualifyC").show();
        }
        pre.addClass("active").siblings("li").removeClass("active");
    }
});