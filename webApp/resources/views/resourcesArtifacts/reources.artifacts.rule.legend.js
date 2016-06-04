/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsRuleLegend = Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.rule.legend.html"),

    events:{
        "click .searEnd":"sele"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},
    //选择
    sele : function(){

        var list = this.$el.closest("ul"),
            data = this.$(".searEnd").data("code"),
            dataKeeper = list.siblings("div").find(".chide"),
            input = list.siblings("div").find(".categoryCode"),
            name = this.model.get("name"),
            dataName = "[" + data +"]";

        input.css({"opacity":"0"}).val(data);
        list.hide();
        dataKeeper.css({"visibility": "visible"}).data("code",data).attr("data-name",name).find("span").html(dataName).siblings("i").html(name);

        var presentRule = App.ResourceArtifacts.presentRule;

        //将属性写入模型，注意如果重绘模型，会导致未保存的丢失，所以所有的修改都要及时保存到模型，最好是blur时保存
         /*data = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
         data["categoryCode"] = id + '';
         App.ResourceArtifacts.presentRule.model.set({"mappingCategory":data});
         App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");
         console.log(App.ResourceArtifacts.presentRule);
*/
    }
});

