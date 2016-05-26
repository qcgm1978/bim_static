App.ResourceArtifacts={
    Settings: {
        delayCount:  0,  //每层加载数量
    },
    PlanNode : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }
        }
    })),

//保存规则模型到服务器，初始化模型
    PlanRules : Backbone.Model.extend({
            defaults:function(){
                return{

                }
            },
        urlType: "",
        parse: function(responese) {
            /*if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }*/
        }
    }),

    ArtifactsRule:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>无数据</li>');
            }
        }
    })),




    init:function(_this) {

        var plans = new App.ResourcesNav.ArtifactsPlanList();
        var pre = new App.ResourcesNav.ArtifactsMapRule();
        _this.$el.append(pre.render().el);
        pre.$(".plans").html(plans.render().el);
        console.log(plans);
        console.log(pre);
        console.log(_this);
        //插入菜单
        //插入计划节点
        //插入默认为空的规则列表
        this.getPlan();
        $("#pageLoading").hide();
    },
    getPlan:function(){
        var _this = this, pdata;

        pdata  = {
            URLtype:"fetchArtifactsPlanLibs",
            data:{}
        };

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanNode.add(response.data);
                //_this.delay(response);
            }
        });
    },

    //延迟
    delay:function(data){
    var _this = this , batch , length = data.length , arr = []  , n = 1 , last;

        batch = Math.ceil(length/20); //循环次数
        last = length % 20; //余数
        if(batch > 0){
            App.ResourceArtifacts.delays = setTimeout(function(){

               // var as = ;

                App.ResourceArtifacts.PlanNode.add();

                _this.delay();

                n++;
            },100);
        }
    },

    rule:{
        equal :"==",
        unequal:"!=",
        inside:"<>",
        outside:"><"
    }
};