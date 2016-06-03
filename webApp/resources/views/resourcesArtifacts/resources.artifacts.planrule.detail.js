/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetail.html"),

    events:{
        "click .desc":"getDetail"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},

    getDetail:function(){
        if(App.ResourceArtifacts.Status.presentPlan){//������
            if( !App.ResourceArtifacts.Status.saved){
                if(App.ResourceArtifacts.openRule == this.model){  //��ǰ
                    this.tabRule();
                    return ;
                }else{
                    alert("������û�����");
                    //����δ�����Ԫ�ز�������ʾ���
                    return;
                }
            }else if(App.ResourceArtifacts.Status.presentRule == this.model){
                this.tabRule();
                return ;
            }
        }
        //�����ݻ��޸��ģ����ĵ�ǰ����
        $(".ruleDetail").empty().hide();
        this.reset();
        //�洢model
        App.ResourceArtifacts.Status.presentRule = this.model;
        var rule = new App.Resources.ArtifactsPlanRuleDetailUnfold({model:App.ResourceArtifacts.Status.presentRule});
        var operator = new App.Resources.ArtifactsPlanRuleDetailOperator().render().el;
        this.$(".ruleDetail").html(rule.render().el);
        rule.$(".mapRule").html(operator);//�����б�
        var operatorData = this.dealStr(App.ResourceArtifacts.Status.presentRule);//��������
        console.log(operatorData);

        App.ResourceArtifacts.operator.reset();
        App.ResourceArtifacts.operator.add(operatorData);
        this.$(".ruleDetail").show();
    },
    //����״̬
    tabRule:function(){
        if(this.$(".ruleDetail:hidden").length){    //δ��ʾ
            this.$(".ruleDetail").show();
        }else{
            this.$(".ruleDetail").hide();
        }
    },

    reset:function(){//����ģ��
        if(App.ResourceArtifacts.Status.presentRule){App.ResourceArtifacts.Status.presentRule=null;}
    },

    //����ַ���
    dealStr:function(model){
        var con = model.get("mappingCategory"),
            list = con.mappingPropertyList;
        if(list && list.length){
            _.each(list,function(item){
                var obj = {left:'',right:'',leftValue:'',rightValue:''};
                if(item.operator == "<>" || item.operator == "><"){
                        var str= item.propertyValue,
                        index;
                    index = _.indexOf(str,",");
                    obj.left =str[0];
                    obj.right = str[str.length-1];
                    for(var i = 1 ; i < str.length-1 ; i++){
                        if(i < index){
                            obj.leftValue =  obj.leftValue + str[i];
                        }else if(i>index){
                            obj.rightValue = obj.rightValue +str[i];
                        }
                    }
                    obj.leftValue = parseInt(obj.leftValue);
                    obj.rightValue = parseInt(obj.rightValue);
                }
                item.ruleList = obj;
            });
        }
        return list;
    }
});