/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

    className : "title",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail",
        "click .ruleCheck":"checked"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        if (this.model.get("ruleContain") == "1"){
            this.$(".ruleCheck").addClass("all");
        }else if(this.model.get("ruleContain") == 3){
            this.$(".ruleCheck").addClass("half");
        }
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.changeCount,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("modelRuleEmpty",this.modelRuleEmpty,this);
        Backbone.on("modelRuleFull",this.modelRuleFull,this);
        Backbone.on("modelRuleHalf",this.modelRuleHalf,this);
    },

    modelRuleEmpty:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").removeClass("all").removeClass("half");
            Backbone.trigger("modelRuleSelectNone");
        }
    },
    modelRuleFull:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")) {
            this.$(".ruleCheck").addClass("all").removeClass("half");
            Backbone.trigger("modelRuleSelectAll");
        }
    },
    modelRuleHalf:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").addClass("half").removeClass("all");
        }
    },

    checked:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        var leaf = this.model.get("leaf");
        var _this = this.$el.closest("li");
        ele.removeClass("half");
        //非叶子节点，加载
        if(!leaf && !this.$el.siblings(".childList").html()){
            this.loadNextTree();
        }
        //存储模型
        var model = JSON.parse(this.$el.closest("li").attr("data-model")),already;
        if(App.ResourceArtifacts.modelSaving.codeIds.length){
            already = _.indexOf(App.ResourceArtifacts.modelSaving.codeIds,function(item){
                return item.code = model.code
            });
        }
        var siblings = _this.siblings("li");
        var father = _this.closest("ul").closest("li");
        var fatherSiblings = father.siblings("li");
        var grandfather = father.closest("ul").closest("li");

        if(siblings.length){
            //查找同类是否有选
            var data = _.filter(siblings,function(item){
                return $(item).attr("data-check") == "1";
            });
            //查找同类是否全不选
            var data1 = _.filter(siblings,function(item){
                return $(item).attr("data-check") == "0";
            });
        }
        if(fatherSiblings.length){
            //查找父级同类是否有选
            var fatherData  =  _.filter(fatherSiblings,function(item){
                return $(item).attr("data-check") == "1";
            });
            //查找父级同类是否全选
            var fatherData1  =  _.filter(fatherSiblings,function(item){
                return $(item).attr("data-check") == "0";
            });
        }
        if(ele.hasClass("all")){
            ele.removeClass("all").removeClass("half");
            _this.attr("data-check","0");
            //取消所有上级菜单，如果本级都未选中，则上级菜单取消half，如果有选中，则增加half
            if(father.length){
                father.attr("data-check","0");
                var pre = this.searchSelf(father);
                pre.removeClass("all").addClass("half");
                if(!data.length){
                    pre.removeClass("half");
                }
            }
            if(grandfather.length){
                grandfather.attr("data-check","0");
                var grPre = this.searchSelf(grandfather);
                grPre.removeClass("all").addClass("half");
                if(!data.length && !fatherData.length){
                    grPre.removeClass("half");
                }
            }
            if(leaf){
                //包含现有
                if(already>0){
                    App.ResourceArtifacts.modelSaving.codeIds[already].ruleIds = []
                }else{
                    model.ruleIds = [];
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectNone");
                }

            }

            //移除所有下级菜单

            if(this.$el.siblings(".childList").find("li").length) {
                _.each(this.$el.siblings(".childList").find("li"),function (item) {
                    console.log();
                    $(item).attr("data-check", "0");
                    $(item).find(".ruleCheck").removeClass("all").removeClass("half")
                });
            }
            this.checkControl("cancel");

        }else{
            ele.addClass("all").removeClass("half");
            _this.attr("data-check","1");

            //选择填充上级菜单，如果本级都未选中，则上级菜单取消half，如果有选中，则增加half
            if(father.length){
                father.attr("data-check","1");
                var pre1 = this.searchSelf(father);
                pre1.addClass("half");
                if(!data1.length){
                    pre1.removeClass("half").addClass("all");
                }
            }
            if(grandfather.length){
                grandfather.attr("data-check","1");
                var grPre1 = this.searchSelf(grandfather);
                grPre1.addClass("half");
                if(!data1.length && !fatherData1.length){
                    _.each(grandfather.find(".ruleCheck"),function(item){
                        $(item).removeClass("half").addClass("all");
                    });
                    grPre1.removeClass("half").addClass("all");
                }
            }

            if(leaf){
                if(already>0){
                    App.ResourceArtifacts.modelSaving.codeIds[already].ruleIds = App.ResourceArtifacts.getValid(model).ruleIds
                }else{
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }
                //操作右侧全选
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectAll");
                }
            }
            //添加所有下级菜单
            if(this.$el.siblings(".childList").find("li").length) {
                _.each(this.$el.siblings(".childList").find("li"),function(item){
                    $(item).attr("data-check","1");
                    if($(item).hasClass("all")){
                        return
                    }
                    $(item).find(".ruleCheck").removeClass("half").addClass("all")
                });
            this.checkControl("check");
            }
        }
    },

    checkControl:function(judge){
        var _this = this,data;
        //此处需重写，从模型中查找叶子元素
        var type = this.model.get("type") ;
        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }
        var allNode = _.filter(data,function(item){
            return item["parentCode"] == _this.model.get("code")
        });


        //存在叶子节点
        var isLeaf = _.filter(allNode,function(item){
            return item.leaf
        });
        if(isLeaf.length){
            _.each(isLeaf, function (item) {
                var model  = item;
                if(judge == "cancel"){
                    model.ruleIds = [];
                }
                if(App.ResourceArtifacts.modelSaving.codeIds.length){
                    for(var i = 0 ; i < App.ResourceArtifacts.modelSaving.codeIds.length ; i++){
                        if(model.code == App.ResourceArtifacts.modelSaving.codeIds[i].code){
                            App.ResourceArtifacts.modelSaving.codeIds[i].ruleIds = model.ruleIds;
                            return
                        }
                    }
                }
                App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
            });
        }

        //存在树枝节点
        var isNotLeaf = _.filter(allNode,function(item){
            return !item.leaf
        });
        if(isNotLeaf.length){
            _.each(isNotLeaf,function(item){
                if(judge == "cancel"){
                    item.ruleIds = [];
                }
                for(var i = 0 ; i < data.length ; i ++){
                    if(item.code == data[i].parentCode){
                        if(App.ResourceArtifacts.modelSaving.codeIds.length){
                            for(var j = 0 ; j < App.ResourceArtifacts.modelSaving.codeIds.length ; j++){
                                if(item.code == App.ResourceArtifacts.modelSaving.codeIds[j].code){
                                    App.ResourceArtifacts.modelSaving.codeIds[j].ruleIds = item.ruleIds;
                                    return
                                }
                            }
                        }
                        App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(data[i]))
                    }
                }
            })
        }
    },


    //查找所给元素的check元素
    searchSelf:function(ele){
        var childList = ele.find(".childList");
        var pre = _.filter(childList,function(item){
            return $(item).attr("data-code") == ele.attr("data-code");
        });
        return   $(pre).eq(0).siblings(".title").find(".ruleCheck");
    },


    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode ){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
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

        if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }

        this. getRules(item);
    },
//切换计划
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },

    loadNextTree:function(){
        var children,data;
        var _this = this,n = this.$el.closest("li").attr("data-check");
        var type = this.model.get("type") ;
        var parentCode = this.model.get("code");

        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }

        if(!this.model.get("leaf")){
            //存在，加载二级或三级标准
            children =  _.filter(data,function(item){
                return item.parentCode == parentCode;
            });
            var list = App.Resources.artifactsQualityTree(children,n);
            _this.$el.closest("li").find(".childList").html(list);
        }
    },

    //获取质量标准相关规则
    getRules:function(event) {
        Backbone.trigger("resetRule");
        var _this = this,pdata,n = this.$el.closest("li").attr("data-check");
        var parentCode = this.model.get("code");
        var leaf = this.model.get("leaf");


        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        this.loadNextTree();
        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");
        if(!leaf){
            return
        }

        this.toggleClass(event);
        //加载规则部分
        App.ResourceArtifacts.Status.rule.targetCode  = parentCode;
        App.ResourceArtifacts.Status.rule.targetName  = this.model.get("name");
        //刷新右面视图
        var code = App.ResourceArtifacts.Status.rule.targetCode;
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.Status.rule.biz = pdata.data.biz = 2 ;
        App.ResourceArtifacts.loading();
        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    App.ResourceArtifacts.Status.rule.count  = response.data.length = 0;
                    Backbone.trigger("mappingRuleNoContent")
                }
                Backbone.trigger("resetTitle");
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});