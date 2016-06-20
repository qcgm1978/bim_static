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
        var ruleContain = this.model.get("ruleContain");
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
        var ele = $(e.target);
        var leaf = this.model.get("leaf");
        var _this = this.$el.closest("li");
        ele.removeClass("half");

        //��Ҷ�ӽڵ㣬����
        if(!leaf && !this.$el.siblings(".childList").html()){
            return
        }

        App.Resources.cancelBubble(e);

        var siblings = _this.siblings("li");
        var father = _this.closest("ul").closest("li");
        var fatherSiblings = father.siblings("li");
        var grandfather = father.closest("ul").closest("li");


        if(siblings.length){
            //����ͬ���Ƿ���ѡ
            var data = _.filter(siblings,function(item){
                return $(item).attr("data-check") == "1";
            });
            //����ͬ���Ƿ�ȫ��ѡ
            var data1 = _.filter(siblings,function(item){
                return $(item).attr("data-check") == "0";
            });
        }
        if(fatherSiblings.length){
            //���Ҹ���ͬ���Ƿ���ѡ
            var fatherData  =  _.filter(fatherSiblings,function(item){
                return $(item).attr("data-check") == "1";
            });
            //���Ҹ���ͬ���Ƿ�ȫѡ
            var fatherData1  =  _.filter(fatherSiblings,function(item){
                return $(item).attr("data-check") == "0";
            });
        }

        if(ele.hasClass("all")){
            ele.removeClass("all").removeClass("half");
            _this.attr("data-check","0");
            //ȡ�������ϼ��˵������������δѡ�У����ϼ��˵�ȡ��half�������ѡ�У�������half
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
                //�����Ҳ�ȫ��ѡ
                return
            }
            //ȡ�������¼��˵�
            if(_this.find("li").length){
                _.each(_this.find("li"),function(item){
                    $(item).attr("data-check","0").find(".ruleCheck").removeClass("all");
                });
            }

        }else{
            ele.addClass("all").removeClass("half");
            _this.attr("data-check","1");

            //ѡ������ϼ��˵������������δѡ�У����ϼ��˵�ȡ��half�������ѡ�У�������half
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
                //�����Ҳ�ȫѡ
                return
            }
            //��������¼��˵�
            if(_this.find("li").length) {
                _.each(_this.find("li"), function (item) {
                    $(item).attr("data-check", "1").find(".ruleCheck").removeClass("half").addClass("all");
                });
            }
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
        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");

        if(!App.ResourceArtifacts.Status.saved){
            alert("������û�����");
            return
        }


        this. getRules(item);
    },
//�л��ƻ�
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },

    //��ȡ������׼��ع���
    getRules:function(item) {
        Backbone.trigger("resetRule");

        var _this = this,pdata,n = this.$el.closest("li").attr("data-check");
        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        var type = this.model.get("type") ;
        var parentCode = this.model.get("code");

        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }

        if(!this.model.get("leaf")){
            //���ڣ����ض�����������׼
            var children,data;
            children =  _.filter(data,function(item){
                 return item.parentCode == parentCode;
             });
            var list = App.Resources.artifactsQualityTree(children,n);
            _this.$el.closest("li").find(".childList").html(list);
            return
        }
        this.toggleClass(item);
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