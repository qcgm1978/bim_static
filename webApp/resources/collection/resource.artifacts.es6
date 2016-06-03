//fetchArtifactsPlan   ��ȡ�ƻ�
//fetchArtifactsPlanRule   ��ȡ����
App.ResourceArtifacts={
    Status:{
        presentPlan:null,  //��ǰ�ƻ�
        saved : true,    //���������ı���״̬���ѱ���  /  δ����
        presentRule : null    //
    },

    Settings: {
        delayCount:  0 , //ÿ���������
        ruleModel: 3   //  Ȩ�����      1 ֻ��ģ�黯��  2 ֻ��������׼  �� 3 ��ģ�黯��������׼
    },

    openRule: null,

    rule:{
        equal :"���",
        unequal:"����",
        inside:"��Χ��",
        outside:"��Χ��"
    },
//�ƻ��ڵ�
    PlanNode : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "fetchArtifactsPlan",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>������</li>');
            }
        }
    })),

//�ƻ�����/��ȡ
    PlanRules:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "fetchArtifactsPlanRule",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>������</li>');
            }
        }
    })),

    //�����ƻ�����
    newPlanRules : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        },
        urlType: "fetchArtifactsPlanNewRule",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
                //����ɹ�
            }
        }
    }),

    //�����ƻ�����
    createPlanRules:function(biz,targetCode,targetName,type){
        //�����µĹ���ӳ��ƻ��ڵ�
        var newPlanRuleData ={
            "biz": 1,//1��ģ�黯��2���ʼ��׼  //�½�ʱд��ֵ
            "targetCode": "",//�½�ʱд�뵱ǰ�ƻ����
            "targetName": "",//�ƻ�����
            "type": 1,//1:��׼����2����Ŀ����  //�½�ʱд��ֵ
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList": [
                    {
                        "propertyKey": "",
                        "operator": "",
                        "propertyValue": ""
                    }
                ]
            }
        };
        //д���������
        newPlanRuleData.biz =  biz;
        newPlanRuleData.targetCode =  targetCode;
        newPlanRuleData.targetName =  targetName || "�½�ӳ�����";
        newPlanRuleData.type =  type;

        return new this.newPlanRules(newPlanRuleData);
    },

//����ƻ�����
    SavePlanRules : Backbone.Model.extend({
            defaults:function(){
                return{
                    code : ""
                }
            },
        urlType: "",
        parse: function(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
                //����ɹ�
            }
        }
    }),

    newModel : {
        "key":"", "rule":"", "value": null
    },

    //�½�����
    newRule : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
        }
    }),
    //�½�����
    newCode : Backbone.Model.extend({
        defaults:function(){
            return{
                code : ""
            }
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
                //$().html('<li>������</li>');
            }
        }
    })),

    init:function(_this) {
        var pre = new App.Resources.ArtifactsMapRule();
        var plans = new App.Resources.ArtifactsPlanList();
        var planRule = new App.Resources.ArtifactsPlanRule();

        _this.$el.append(pre.render().el);//�˵�

        pre.$(".plans").html(plans.render().el);//�ƻ��ڵ�
        pre.$(".rules").append(planRule.render().el);//�˵�
        pre.$(".rules").append(planRule.render().el);//�˵�

        //����Ĭ��Ϊ�յĹ����б�
        this.getPlan();

        $("#pageLoading").hide();
    },


    //ȱʡ����
    defaultLoad:function(_this){
        var pre = new App.Resources.ArtifactsMapRule();
        _this.$el.append(pre.render().el);//�˵�
        var plans = new App.Resources.ArtifactsPlanList();
        var planRule = new App.Resources.ArtifactsPlanRule();
        pre.$(".plans").html(plans.render().el);//�ƻ��ڵ�
        pre.$(".rules").append(planRule.render().el);//�˵�
    },


    getPlan:function(){
        var _this = this, pdata;

        pdata  = {
            URLtype:"fetchArtifactsPlan",
            data:{}
        };

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data.length){
                App.ResourceArtifacts.PlanNode.add(response.data);
                //_this.delay(response);
            }
        });
    },
    //�ӳ�
    delay:function(data){
    var _this = this , batch , length = data.length , arr = []  , n = 1 , last;

        batch = Math.ceil(length/20); //ѭ������
        last = length % 20; //����
        if(batch > 0){
            App.ResourceArtifacts.delays = setTimeout(function(){
               // var as = ;
                App.ResourceArtifacts.PlanNode.add();

                _this.delay();

                n++;
            },100);
        }
    },

    //��ʾ����
    alertSave:function(){

    }
};