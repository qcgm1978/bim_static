/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

    className : "title",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        //this.listenTo(App.ResourceArtifacts.Status.presentPlan,"chang",this.getChangeAttr);    //监听展开的模型是否被更改，如果更改，列出更改项，提示保存
    },

    //取得模型修改过的属性
    getChangeAttr:function(e){
        console.log("模型已被更改");
    },

    //取得规则列表
    getDetail:function(e){

        this.$(".fold").addClass("active");
        var hasCon =  this.$(".item").closest(".title").siblings(".childList:hidden");
        if(hasCon.length && hasCon.html()){
            hasCon.show();//显示列表
            return
        }
        var innerCon =  this.$(".item").closest(".title").siblings(".childList:visible");
        if(innerCon.html()){
            innerCon.hide();//隐藏列表
            this.$(".fold").removeClass("active");
            return
        }

        var item = $(e.target);
        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");

        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }

        this.toggleClass(item);
        this. getRules();
        //保存计划规则
        App.ResourceArtifacts.Status.presentPlan = null;
        App.ResourceArtifacts.Status.presentPlan = this.model;
    },
//切换计划
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },

    //获取质量标准相关规则
    getRules:function() {
        var _this = this,pdata;
        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        if(!this.model.get("leaf")){
            //存在，加载二级或三级标准
            pdata = {
                URLtype : 'fetchArtifactsQuality',
                data : {
                    type : App.ResourceArtifacts.Status.type,
                    standardType:"GC",
                    parentCode :this.model.get("code")  //传递父节点
                }
            };

            App.ResourceArtifacts.PlanRules.reset();

            App.Comm.ajax(pdata,function(response){
                if(response.code == 0 && response.data){
                    if(response.data.length){
                        var list = App.Resources.artifactsQualityTree(response.data);
                        _this.$el.closest("li").find(".childList").html(list);
                    }else{
                        //无数据咋办
                    }
                }
            });
            return
        }
        $(".artifactsContent .rules ul").empty();
        //刷新右面视图
        var code = App.ResourceArtifacts.Status.rule.targetCode;
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                biz:App.ResourceArtifacts.Status.rule.biz,
                type:App.ResourceArtifacts.Status.type
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                App.ResourceArtifacts.PlanRules.reset();
                $(".artifactsContent .rules h2 .name").html(_this.model.get("code") + "&nbsp;" +_this.model.get("name"));
                $(".artifactsContent .rules h2 i").html( "("+response.data.length + ")");
                if(response.data){
                    if( response.data.length){
                        $(".artifactsContent .rules ul").empty();
                        App.ResourceArtifacts.PlanRules.add(response.data);
                    }else{
                        $(".ruleContent ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
                    }
                }
            }
        });
    }
});