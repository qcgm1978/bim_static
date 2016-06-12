/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .default" : "create"

    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);

        App.ResourceArtifacts.Status.rule.biz = 1;
        var power = App.ResourceArtifacts.Settings.ruleModel;
        if(power == 1){
            this.$(".modularization").remove();
            this.$(".quality").addClass("active");
        }else if(power == 2){
            App.ResourceArtifacts.Status.rule.biz = 2;
            this.$(".quality").remove();
        }
        return this;
    },

    initialize:function(){
        this.getCategoryCode(); //获取分类编码
        Backbone.on("startFromProject",this.startFromProject,this);
    },

    startFromProject:function(){
        
    },

    select:function(e){
        var $pre = $(e.target),_this = this;

        if(!App.ResourceArtifacts.Status.saved ){
            alert("请先保存！");
        }

        if(!App.ResourceArtifacts.Status.projectId){
            App.ResourceArtifacts.Status.type = 1
        }

        if($pre.closest(".artifactsNav").length){
            $pre.addClass("active").siblings("li").removeClass("active");
        }


        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//模块化
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }

            this.$(".plans").html(App.ResourceArtifacts.plans.render().el);//计划节点
            App.ResourceArtifacts.getPlan();

            this.$(".qualifyC").hide();
            this.$(".plans").show();
            this.resetRule();

        }else if(quality){//质量
            App.ResourceArtifacts.Status.rule.biz = 2 ;
            if(this.$(".default:visible").length){
                return
            }

            this.$(".qualifyC").html(App.ResourceArtifacts.quality.render().el);
            var pdata = {
                URLtype:'fetchArtifactsQuality',
                data:{
                    type:App.ResourceArtifacts.Status.type,
                    standardType: "GC"
                }
            };
            App.ResourceArtifacts.getQuality(pdata,_this);
            this.resetRule();

            this.$(".plans").hide();
            this.$(".qualifyC").show();
        }

        this.$(".rules").show();

    },

    getCategoryCode:function(){
        var cdata  = {
            URLtype:'fetchArtifactsCategoryRule',
            data :{
            }
        };
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.length){
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },
    //重置规则
    resetRule:function(){
        this.$(".rules h2 name").text("没有选择模块/质量标准");
        //this.$(".ruleContent ul").html("<li><div class='ruleTitle delt'>没有选择模块/质量标准</div></li>");
    },

    //为项目设置创建规则
    create:function(e){
        this.$(".default").hide();
        this.select(e);
    }
});