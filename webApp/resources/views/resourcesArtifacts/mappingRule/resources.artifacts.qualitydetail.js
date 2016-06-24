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
        if (this.model.get("ruleContain") == 1){
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
            this.changeFatherStatus("cancel");
        }
    },
    modelRuleFull:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")) {
            this.$(".ruleCheck").addClass("all").removeClass("half");
            Backbone.trigger("modelRuleSelectAll");
            this.changeFatherStatus("check");
        }
    },
    modelRuleHalf:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").addClass("half").removeClass("all");
            this.changeFatherStatus("check");
        }
    },

    checked:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        var leaf = this.model.get("leaf");
        var _this = this.$el.closest("li");
        ele.removeClass("half");
        //��Ҷ�ӽڵ㣬����
        if(!leaf && !this.$el.siblings(".childList").html()){
            this.loadNextTree();
        }

        //�洢ģ��
        var model = JSON.parse(this.$el.closest("li").attr("data-model")),already;
        var modelSaving = App.ResourceArtifacts.modelSaving.codeIds;
        var n = "string";
        for(var is = 0 ; is < modelSaving.length ; is++){
            if(modelSaving[is].code == this.model.get("code")){
                n = is;
                break
            }
        }
        if(ele.hasClass("all")){
            ele.removeClass("all").removeClass("half");
            _this.attr("data-check","0");
            //ȡ�������ϼ��˵�
            this.changeFatherStatus("cancel");
            if(leaf){
                //��������
                if(n=="string"){
                    model.ruleIds = [];
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }else{
                    App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = []
                }
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectNone");
                }
            }else{
                //�Ƴ������¼��˵�
                if(this.$el.siblings(".childList").find("li").length) {
                    _.each(this.$el.siblings(".childList").find("li"),function (item) {
                        $(item).attr("data-check", "0");
                        $(item).find(".ruleCheck").removeClass("all").removeClass("half")
                    });
                }
                this.checkControl(e,"cancel");
            }
        }else{
            ele.addClass("all").removeClass("half");
            _this.attr("data-check","1");
            //ѡ������ϼ��˵�
            this.changeFatherStatus("check");

            if(leaf){
                //��������
                if(n=="string"){
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }else{
                    App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = App.ResourceArtifacts.getValid(model).ruleIds
                }
                //�����Ҳ�ȫѡ
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectAll");
                }
            }else{
                //��������¼��˵�
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
        }
    },

    //��������״̬
    changeFatherStatus:function(status){
        var _this = this.$el.closest("li");
        var siblings = _this.siblings("li");
        var father = _this.closest("ul").closest("li");
        var fatherSiblings = father.siblings("li");
        var grandfather = father.closest("ul").closest("li");
        var val = status == "check" ? "0" : "1";
        var pre,grPre,data,fatherData,arr1=[],arr2 = [];

        if(siblings.length){//���Ԫ��
            data = _.filter(siblings,function(item){
                return $(item).attr("data-check") == val;
            });
        }else{//ֻ��һ��Ԫ��
            data = arr1.push(_this);
        }
        if(fatherSiblings.length){
            //���Ҹ���ͬ���Ƿ���ѡ
            fatherData  =  _.filter(fatherSiblings,function(item){
                return $(item).attr("data-check") == val;
            });
        }else{
            fatherData = arr2.push(father);
        }
        if(status == "cancel"){
            if(father.length){
                father.attr("data-check","0");
                pre = this.searchSelf(father);
                pre.removeClass("all").addClass("half");
                if(!data.length){
                    pre.removeClass("half");
                }
            }
            if(grandfather.length){
                grandfather.attr("data-check","0");
                grPre = this.searchSelf(grandfather);
                grPre.removeClass("all").addClass("half");
                if(!data.length && !fatherData.length){
                    grPre.removeClass("half");
                }
            }
        }else if(status == "check"){
            if(father.length){
                father.attr("data-check","1");
                pre = this.searchSelf(father);
                pre.addClass("half");
                if(!data.length){
                    pre.removeClass("half").addClass("all");
                }
            }
            if(grandfather.length){
                grandfather.attr("data-check","1");
                grPre = this.searchSelf(grandfather);
                grPre.addClass("half");

                if(!data.length && !fatherData.length){
                    _.each(grandfather.find(".ruleCheck"),function(item){
                        $(item).removeClass("half").addClass("all");
                    });
                    grPre.removeClass("half").addClass("all");
                }
            }
        }
    },

    //Ϊģ��-��������
    checkControl:function(judge){
        var _this = this,data;
        var type = this.model.get("type") ;
        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }
        var allNode = _.filter(data,function(item){
            return item["parentCode"] == _this.model.get("code")
        });
        //����Ҷ�ӽڵ�
        var isLeaf = _.filter(allNode,function(item){
            return item.leaf
        });
        if(isLeaf.length){
            _.each(isLeaf, function (item) {
                var model  = item;
                var val = model.ruleIds;
                if(judge == "cancel"){
                    val = [];
                }
                if(App.ResourceArtifacts.modelSaving.codeIds.length){
                    for(var i = 0 ; i < App.ResourceArtifacts.modelSaving.codeIds.length ; i++){
                        if(model.code == App.ResourceArtifacts.modelSaving.codeIds[i].code){
                            App.ResourceArtifacts.modelSaving.codeIds[i].ruleIds = val;
                            return
                        }
                    }
                }
                App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
            });
        }
        //������֦�ڵ�
        var isNotLeaf = _.filter(allNode,function(item){
            return !item.leaf
        });
        if(isNotLeaf.length){
            _.each(isNotLeaf,function(item){
                var childrenCode = _.filter(data,function(model){
                    return item.code == model.parentCode
                });
                _.each(childrenCode,function(leafNode){
                    var val = leafNode.ruleIds;
                    if(judge == "cancel"){
                        val = [];
                    }
                    if(App.ResourceArtifacts.modelSaving.codeIds.length){
                        for(var j = 0 ; j < App.ResourceArtifacts.modelSaving.codeIds.length ; j++){
                            if(leafNode.code == App.ResourceArtifacts.modelSaving.codeIds[j].code){
                                App.ResourceArtifacts.modelSaving.codeIds[j].ruleIds = val;
                                return
                            }
                        }
                    }
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(leafNode))
                });
            })
        }
    },
    //��������Ԫ�ص�checkԪ��
    searchSelf:function(ele){
        var childList = ele.find(".childList");
        var pre = _.filter(childList,function(item){
            return $(item).attr("data-code") == ele.attr("data-code");
        });
        return   $(pre).eq(0).siblings(".title").find(".ruleCheck");
    },
    //��������ʱ�Ĳ���
    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode ){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
    },
    //ȡ�ù����б�
    getDetail:function(e){
        this.$(".fold").addClass("active");
        var hasCon =  this.$(".item").closest(".title").siblings(".childList:hidden");
        if(hasCon.length && hasCon.html()){
            hasCon.show();//��ʾ�б�
            return
        }
        var innerCon =  this.$(".item").closest(".title").siblings(".childList:visible");
        if(innerCon.html()){
            innerCon.hide();//�����б�
            this.$(".fold").removeClass("active");
            return
        }
        var item = $(e.target);
        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }
        if(this.model.get("leaf")){
            this. getRules(item);
        }else if(!this.$(".item").closest(".title").siblings(".childList").html()){}{
            this.loadNextTree();
        }
    },
    //�л��ƻ�
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },
    //��������
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
            //���ڣ����ض�����������׼
            children =  _.filter(data,function(item){
                return item.parentCode == parentCode;
            });
            var list = App.Resources.artifactsQualityTree(children,n);
            _this.$el.closest("li").find(".childList").html(list);
        }
    },

    //��ȡ������׼��ع���
    getRules:function(event) {
        Backbone.trigger("resetRule");//�����Ҳ����
        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        var _this = this,pdata;
        var parentCode = this.model.get("code");
        var leaf = this.model.get("leaf");
        var ruleContain = this.$el.closest("li").attr("data-ruleContain");
        App.ResourceArtifacts.Status.check = this.$el.closest("li").attr("data-check");

        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");

        this.toggleClass(event);
        //���ع��򲿷�
        App.ResourceArtifacts.Status.rule.targetCode  = parentCode;
        App.ResourceArtifacts.Status.rule.targetName  = this.model.get("name");
        //ˢ��������ͼ
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
        App.ResourceArtifacts.loading($(".rules"));
        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                    if(ruleContain == "1"){
                        Backbone.trigger("modelRuleSelectAll");
                    }
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