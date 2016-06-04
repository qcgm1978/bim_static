/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Resources.ArtifactsWindowRule = Backbone.View.extend({

    tagName :'div',
    className:"resourcesAlert",

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.window.rule.html"),

    events:{
        "click .windowSubmit":"sure"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(models){

    },
    //确定
    sure : function(){
        var _this = this,data,
        code  = $(".ruleNodeName span.active").closest(".ruleNodeName").data("id");

        if(code){
            data = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
            data["categoryCode"] = code + '';
            App.ResourceArtifacts.presentRule.model.set({"mappingCategory":data});
            App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");

            //以下内容可重构
            var operator = new App.Resources.ArtifactsPlanRuleDetailOperator().render().el;
            $(".ruleDetail .mapRule").html(operator);//规则列表
            var operatorData = App.Resources.dealStr(App.ResourceArtifacts.Status.presentRule);//规则数据
            App.ResourceArtifacts.operator.reset();
            App.ResourceArtifacts.operator.add(operatorData);
        }

        App.Resources.ArtifactsMaskWindow.close();
    },
        //取消
    cancel:function(){
        App.Resources.ArtifactsMaskWindow.close();
    },
    //关闭
    close:function(){
        App.Resources.ArtifactsMaskWindow.close();
    }
});

